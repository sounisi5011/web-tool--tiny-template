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
        [P in Exclude<TypeNodeTypes, 'union'>]?: Extract<TypeNode, { type: P }>;
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
export type TypeNodeTypes = TypeNode['type'];
