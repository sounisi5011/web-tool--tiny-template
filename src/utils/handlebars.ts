import hbs from 'handlebars';

import { objectEntries } from '.';

export interface BaseTypeNode<T extends string> {
    type: T;
}
export interface BaseTypeParentNode<TType extends string, TChildren> extends BaseTypeNode<TType> {
    children: TChildren;
}
export interface RecordTypeNode extends BaseTypeParentNode<'record', TypeNodeRecord> {}
export interface ArrayTypeNode extends BaseTypeParentNode<'array', TypeNode> {}
export interface BooleanTypeNode extends BaseTypeNode<'boolean'> {}
export interface StringTypeNode extends BaseTypeNode<'string'> {}
export type TypeNode = RecordTypeNode | ArrayTypeNode | BooleanTypeNode | StringTypeNode;
export type TypeNodeRecord = Record<string, TypeNode>;

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

export function mergeTypeNodeRecord(...sources: TypeNodeRecord[]): TypeNodeRecord {
    const record: TypeNodeRecord = {};
    for (const sourceRecord of sources) {
        objectEntries(sourceRecord)
            .map(([prop, sourceNode]) => ({ prop, targetNode: record[prop], sourceNode }))
            .map<[string, TypeNode]>(({ prop, targetNode, sourceNode }) => {
                if (targetNode) {
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
        const localContextRecord = ast2node(astNode.program);
        const { this: localContextThisVar } = getThisVar(localContextRecord);
        return pathExpressionAST2node<ArrayTypeNode>(
            contextVar,
            {
                type: 'array',
                children: localContextThisVar ?? { type: 'record', children: localContextRecord },
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
