import hbs from 'handlebars';

import { objectEntries, objectValues } from '.';

export interface BaseTypeNode<T extends string> {
    type: T;
}
export interface BaseTypeParentNode<TType extends string, TChildren> extends BaseTypeNode<TType> {
    children: TChildren;
}
export interface RecordTypeNode extends BaseTypeParentNode<'record', TypeNodeRecord> {}
export interface ArrayTypeNode extends BaseTypeParentNode<'array', TypeNode> {}
export interface UnionTypeNode extends BaseTypeParentNode<'union', TypeNodeRecord> {
    children: {
        [P in Exclude<TypeNodeTypes, 'union'>]?: TypeNode extends infer TNode ? FindMatchType<TNode, { type: P }>
            : never;
    };
}
export interface BooleanTypeNode extends BaseTypeNode<'boolean'> {}
export interface StringTypeNode extends BaseTypeNode<'string'> {}
export interface UndefinedTypeNode extends BaseTypeNode<'undefined'> {}
export type TypeNode =
    | RecordTypeNode
    | ArrayTypeNode
    | UnionTypeNode
    | BooleanTypeNode
    | StringTypeNode
    | UndefinedTypeNode;
export type TypeNodeRecord = Record<string, TypeNode>;
export type TypeNodeTypes = TypeNode extends { type: infer U } ? U : never;

type FirstParamType<T> = T extends (...args: infer P) => unknown ? P[0] : never;
type HandlebarsASTNode = Exclude<FirstParamType<hbs.ICompiler[keyof hbs.ICompiler]>, undefined>;
type FindMatchType<TTarget, TCond> = TTarget extends TCond ? TTarget : never;
type HandlebarsASTBlockStatement = FindMatchType<HandlebarsASTNode, { type: 'BlockStatement' }>;

function isMatchType<TNode extends { type: string }>(
    astNode: TNode,
    type: 'Program',
): astNode is FindMatchType<TNode, { body: unknown[] }>;
function isMatchType<TNode extends { type: string }, TType extends string>(
    astNode: TNode,
    type: TType,
): astNode is FindMatchType<TNode, { type: TType }>;
function isMatchType(astNode: { type: string }, type: string): boolean {
    return astNode.type === type;
}

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

export function mergeTypeNodeRecord(...sources: TypeNodeRecord[]): TypeNodeRecord {
    const record: TypeNodeRecord = {};
    for (const sourceRecord of sources) {
        objectEntries(sourceRecord)
            .map(([prop, sourceNode]) => ({ prop, targetNode: record[prop], sourceNode }))
            .map<[string, TypeNode]>(({ prop, targetNode, sourceNode }) => {
                if (targetNode) {
                    if (
                        targetNode.type !== sourceNode.type || targetNode.type === 'union'
                        || sourceNode.type === 'union'
                    ) {
                        return [
                            prop,
                            genUnionTypeNode([targetNode, sourceNode]),
                        ];
                    }
                    if (targetNode.type === 'record' && sourceNode.type === 'record') {
                        return [
                            prop,
                            { ...sourceNode, children: mergeTypeNodeRecord(targetNode.children, sourceNode.children) },
                        ];
                    }
                }
                return [prop, sourceNode];
            })
            .forEach(([prop, node]) => {
                record[prop] = node;
            });
    }
    return record;
}

function ast2node(astNode: HandlebarsASTNode): TypeNodeRecord {
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

function pathExpressionAST2node<T extends TypeNode>(
    astNode: HandlebarsASTNode,
    valueNode: T,
): Record<string, T | RecordTypeNode> | null {
    if (!isMatchType(astNode, 'PathExpression')) return null;

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
    if (record) return record;

    /*
     * {{ this }}
     * ↓
     * { '': valueNode }
     */
    return {
        '': valueNode,
    };
}

function localContextBlockAST2node(astNode: HandlebarsASTBlockStatement): TypeNodeRecord | null {
    const blockHelperName = astNode.path.original;
    if (blockHelperName === 'each') {
        /**
         * @see https://handlebarsjs.com/guide/builtin-helpers.html#each
         */
        const [contextVar] = astNode.params;
        if (!contextVar) return null;
        const { this: localContextThisVar, other: localContextRecord } = getThisVar(ast2node(astNode.program));

        let arrayChildrenNode: TypeNode = { type: 'undefined' };
        if (localContextRecord) {
            const recordNode: RecordTypeNode = { type: 'record', children: localContextRecord };
            if (localContextThisVar) {
                /*
                 * {{#each foo}} {{this}} {{hoge}} {{/each}}
                 * ↓
                 * { foo: ArrayTypeNode }
                 * { foo: { children: UnionTypeNode } }
                 * { foo: { children: { children: { string: StringTypeNode, record: RecordTypeNode } } } }
                 * { foo: { children: { children: { record: { children: { hoge: StringTypeNode } } } } } }
                 */
                arrayChildrenNode = genUnionTypeNode([localContextThisVar, recordNode]);
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
                children: arrayChildrenNode,
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
