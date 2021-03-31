import hbs from 'handlebars';

import { objectEntries } from '.';

export interface BaseTypeNode<T extends string> {
    type: T;
}
export interface BaseTypeParentNode<TType extends string, TChildren extends (unknown[] | Record<string, unknown>)>
    extends BaseTypeNode<TType>
{
    children: TChildren;
}
export interface RecordTypeNode extends BaseTypeParentNode<'record', TypeNodeRecord> {}
export interface ArrayTypeNode extends BaseTypeParentNode<'array', TypeNode[]> {}
export interface BooleanTypeNode extends BaseTypeNode<'boolean'> {}
export interface StringTypeNode extends BaseTypeNode<'string'> {}
export type TypeNode = RecordTypeNode | ArrayTypeNode | BooleanTypeNode | StringTypeNode;
export type TypeNodeRecord = Record<string, TypeNode>;

type FirstParamType<T> = T extends (...args: infer P) => unknown ? P[0] : never;
type HandlebarsASTNode = Exclude<FirstParamType<hbs.ICompiler[keyof hbs.ICompiler]>, undefined>;
type FindMatchType<TTarget, TCond> = TTarget extends TCond ? TTarget : never;

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
        const { path } = astNode;
        if (isMatchType(path, 'PathExpression')) {
            /*
             * {{ foo }}
             * ↓
             * { foo: StringTypeNode }
             *
             * {{ foo.bar }}
             * ↓
             * { foo: RecordTypeNode }
             * { foo: { children: { bar: StringTypeNode } } }
             */
            const record = path.parts
                .reverse()
                .reduce<Record<string, StringTypeNode | RecordTypeNode> | null>(
                    (children, part) => {
                        if (children) {
                            return { [part]: { type: 'record', children } };
                        } else {
                            return { [part]: { type: 'string' } };
                        }
                    },
                    null,
                );
            if (record) return record;

            /*
             * {{ this }}
             * ↓
             * { '': StringTypeNode }
             */
            return {
                '': { type: 'string' },
            };
        }
    }
    return {};
}

export function getVariableRecord(template: string): TypeNodeRecord {
    const ast = hbs.parse(template);
    return ast2node(ast);
}
