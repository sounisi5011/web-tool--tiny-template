import hbs from 'handlebars';

import { objectEntries, objectValues } from '.';
import type * as HandlebarsAST from './handlebars/ast';
import { isMatchType } from './handlebars/ast';
import type {
    ArrayTypeNode,
    RecordTypeNode,
    StringTypeNode,
    TypeNode,
    TypeNodeRecord,
    UnionTypeNode,
} from './handlebars/node';

export function genUnionTypeNode(childNodeList: readonly TypeNode[]): UnionTypeNode {
    const duplicatedTypes: Set<string> = new Set();
    const children = childNodeList.reduce<UnionTypeNode['children']>((children, childNode) => {
        const childNodeListExcludeUnion: Array<Exclude<TypeNode, UnionTypeNode>> = childNode.type === 'union'
            ? objectValues(childNode.children)
            : [childNode];
        return childNodeListExcludeUnion.reduce((children, childNodeExcludeUnion) => {
            const { type } = childNodeExcludeUnion;
            if (type in children) duplicatedTypes.add(type);
            return { ...children, [type]: childNodeExcludeUnion };
        }, children);
    }, {});

    if (duplicatedTypes.size > 0) {
        throw new Error(`The following types are duplicated: ${[...duplicatedTypes].join(', ')}`);
    }

    return {
        type: 'union',
        children,
    };
}

function mergeTypeNode(childNode1: TypeNode, childNode2: TypeNode): RecordTypeNode | UnionTypeNode {
    if (childNode1.type === 'record' && childNode2.type === 'record') {
        return mergeRecordTypeNode(childNode1, childNode2);
    } else {
        return genUnionTypeNode([childNode1, childNode2]);
    }
}

function mergeRecordTypeNode(...childNodeList: RecordTypeNode[]): RecordTypeNode {
    return {
        type: 'record',
        children: mergeTypeNodeRecord(...childNodeList.map(childNode => childNode.children)),
    };
}

export function mergeTypeNodeRecord(...sources: TypeNodeRecord[]): TypeNodeRecord {
    const record: TypeNodeRecord = {};
    for (const sourceRecord of sources) {
        objectEntries(sourceRecord)
            .map(([prop, sourceNode]) => ({ prop, targetNode: record[prop], sourceNode }))
            .map<[string, TypeNode]>(({ prop, targetNode, sourceNode }) => {
                if (targetNode) {
                    return [
                        prop,
                        mergeTypeNode(targetNode, sourceNode),
                    ];
                }
                return [prop, sourceNode];
            })
            .forEach(([prop, node]) => {
                record[prop] = node;
            });
    }
    return record;
}

function ast2node(astNode: HandlebarsAST.AllNode): TypeNodeRecord {
    if (isMatchType(astNode, 'Program')) {
        return mergeTypeNodeRecord(...astNode.body.map(ast2node));
    } else if (isMatchType(astNode, 'MustacheStatement')) {
        /*
         * {{ foo }}
         * ↓
         * { foo: StringTypeNode }
         *
         * {{ foo.bar }}
         * ↓
         * { foo: RecordTypeNode }
         * { foo: { children: { bar: StringTypeNode } } }
         *
         * {{ this }}
         * ↓
         * { '': StringTypeNode }
         */
        const record = pathExpressionAST2node<StringTypeNode>(astNode.path, { type: 'string' });
        if (record) return record;
    } else if (isMatchType(astNode, 'BlockStatement')) {
        const localContextBlockRecord = localContextBlockAST2node(astNode);
        if (localContextBlockRecord) return localContextBlockRecord;
    }
    return {};
}

/**
 * @param ignoreAtData
 * `@key`や`@index`のような{@link https://handlebarsjs.com/api-reference/data-variables.html `@data`変数}を無視する
 */
function pathExpressionAST2node<T extends TypeNode>(
    astNode: HandlebarsAST.AllNode,
    valueNode: T,
    ignoreAtData = true,
): Record<string, T | RecordTypeNode> | null {
    if (!isMatchType(astNode, 'PathExpression') || (ignoreAtData && astNode.data)) return null;

    /*
     * {{ foo }}
     * ↓
     * { foo: valueNode }
     *
     * {{ foo.bar }}
     * ↓
     * { foo: RecordTypeNode }
     * { foo: { children: { bar: valueNode } } }
     */
    const record = astNode.parts
        .reverse()
        .reduce<Record<string, T | RecordTypeNode> | null>(
            (children, part) => {
                if (children) {
                    return { [part]: { type: 'record', children } };
                } else {
                    return { [part]: valueNode };
                }
            },
            null,
        );
    if (record) {
        /*
         * {{ this.* }}
         * {{ this/* }}
         * ↓
         * { '': RecordTypeNode }
         * { '': { children: record } }
         */
        if (/^this\b/.test(astNode.original) && astNode.parts.join('.').length < astNode.original.length) {
            return {
                '': { type: 'record', children: record },
            };
        }
        return record;
    }

    /*
     * {{ this }}
     * ↓
     * { '': valueNode }
     */
    return {
        '': valueNode,
    };
}

function localContextBlockAST2node(astNode: HandlebarsAST.BlockStatement): TypeNodeRecord | null {
    const blockHelperName = astNode.path.original;
    if (blockHelperName === 'each') {
        /**
         * @see https://handlebarsjs.com/guide/builtin-helpers.html#each
         */
        const [contextVar] = astNode.params;
        if (!contextVar) return null;
        const { blockParams: [contextName] = [] } = astNode.program;
        const { this: localContextThisVar, other: localContextRecord } = getThisVar(ast2node(astNode.program));

        let arrayChildrenNode: TypeNode | undefined;
        if (localContextRecord) {
            const recordNode: RecordTypeNode = { type: 'record', children: localContextRecord };
            if (localContextThisVar) {
                if (contextName !== undefined) {
                    const localContextNode = recordNode.children[contextName];
                    /*
                     * {{#each foo as |bar|}} {{this.baz}} {{bar.hoge}} {{/each}}
                     * ↓
                     * { foo: ArrayTypeNode }
                     * { foo: { children: RecordTypeNode } }
                     * { foo: { children: { children: { baz: StringTypeNode, hoge: StringTypeNode } } } }
                     *
                     * {{#each foo as |bar|}} {{this.hoge}} {{bar}} {{/each}}
                     * ↓
                     * { foo: ArrayTypeNode }
                     * { foo: { children: UnionTypeNode } }
                     * { foo: { children: { children: { string: StringTypeNode, record: RecordTypeNode } } } }
                     * { foo: { children: { children: { record: { children: { hoge: StringTypeNode } } } } } }
                     *
                     * {{#each foo as |bar|}} {{this.baz}} {{hoge}} {{/each}}
                     * ↓
                     * { foo: ArrayTypeNode }
                     * { foo: { children: RecordTypeNode } }
                     * { foo: { children: { children: { baz: StringTypeNode } } } }
                     */
                    arrayChildrenNode = localContextNode
                        ? mergeTypeNode(localContextThisVar, localContextNode)
                        : localContextThisVar;
                } else {
                    /*
                     * {{#each foo}} {{this.bar}} {{hoge}} {{/each}}
                     * ↓
                     * { foo: ArrayTypeNode }
                     * { foo: { children: RecordTypeNode } }
                     * { foo: { children: { children: { bar: StringTypeNode, hoge: StringTypeNode } } } }
                     *
                     * {{#each foo}} {{this}} {{hoge}} {{/each}}
                     * ↓
                     * { foo: ArrayTypeNode }
                     * { foo: { children: UnionTypeNode } }
                     * { foo: { children: { children: { string: StringTypeNode, record: RecordTypeNode } } } }
                     * { foo: { children: { children: { record: { children: { hoge: StringTypeNode } } } } } }
                     */
                    arrayChildrenNode = mergeTypeNode(localContextThisVar, recordNode);
                }
            } else {
                if (contextName !== undefined) {
                    /*
                     * {{#each foo as |bar|}} {{bar.hoge}} {{/each}}
                     * ↓
                     * { foo: ArrayTypeNode }
                     * { foo: { children: RecordTypeNode } }
                     * { foo: { children: { children: { hoge: StringTypeNode } } } }
                     */
                    arrayChildrenNode = recordNode.children[contextName];
                } else {
                    /*
                     * {{#each foo}} {{hoge}} {{/each}}
                     * ↓
                     * { foo: ArrayTypeNode }
                     * { foo: { children: RecordTypeNode } }
                     * { foo: { children: { children: { hoge: StringTypeNode } } } }
                     */
                    arrayChildrenNode = recordNode;
                }
            }
        } else if (localContextThisVar) {
            /*
             * {{#each foo}} {{this}} {{/each}}
             * ↓
             * { foo: ArrayTypeNode }
             * { foo: { children: localContextThisVar } }
             */
            arrayChildrenNode = localContextThisVar;
        }

        return pathExpressionAST2node<ArrayTypeNode>(
            contextVar,
            {
                type: 'array',
                children: arrayChildrenNode ?? { type: 'undefined' },
            },
        );
    }
    return null;
}

function getThisVar(record: TypeNodeRecord): { this: TypeNode | undefined; other: TypeNodeRecord | undefined } {
    const { '': self, ...other } = record;
    return {
        this: self,
        other: Object.keys(other).length > 0 ? other : undefined,
    };
}

export function getVariableRecord(template: string): TypeNodeRecord {
    const ast = hbs.parse(template);
    return ast2node(ast);
}
