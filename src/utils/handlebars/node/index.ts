import { objectEntries, objectValues } from '../..';

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
        [P in Exclude<TypeNodeTypes, 'union' | 'undefined'>]?: Extract<TypeNode, { type: P }>;
    };
}
export interface BooleanTypeNode extends BaseTypeNode<'boolean'> {}
export interface StringTypeNode extends BaseTypeNode<'string'> {}
export interface UndefinedTypeNode extends BaseTypeNode<'undefined'> {}
export type PrimitiveTypeNode = UndefinedTypeNode | BooleanTypeNode | StringTypeNode;
export type TypeNode = PrimitiveTypeNode | RecordTypeNode | ArrayTypeNode | UnionTypeNode;
export type TypeNodeRecord = Record<string, TypeNode>;
export type TypeNodeTypes = TypeNode['type'];

export function createPrimitiveTypeNode<T extends PrimitiveTypeNode['type']>(
    type: T,
): Extract<PrimitiveTypeNode, { type: T }>;
export function createPrimitiveTypeNode(type: PrimitiveTypeNode['type']): PrimitiveTypeNode {
    return { type };
}

/**
 * `UndefinedTypeNode`型の値を作成する
 */
export function createUndefinedTypeNode(): UndefinedTypeNode {
    return createPrimitiveTypeNode('undefined');
}

/**
 * `BooleanTypeNode`型の値を作成する
 */
export function createBooleanTypeNode(): BooleanTypeNode {
    return createPrimitiveTypeNode('boolean');
}

/**
 * `StringTypeNode`型の値を作成する
 */
export function createStringTypeNode(): StringTypeNode {
    return createPrimitiveTypeNode('string');
}

/**
 * `RecordTypeNode`型の値を作成する
 */
export function createRecordTypeNode(childrenRecord: RecordTypeNode['children']): RecordTypeNode {
    return {
        type: 'record',
        children: childrenRecord,
    };
}

/**
 * `ArrayTypeNode`型の値を作成する
 */
export function createArrayTypeNode(item: ArrayTypeNode['children']): ArrayTypeNode {
    return {
        type: 'array',
        children: item,
    };
}

/**
 * `UnionTypeNode`型の値を作成する
 */
export function createUnionTypeNode(childrenList: ReadonlyArray<Exclude<TypeNode, UndefinedTypeNode>>): UnionTypeNode {
    const mergedChildren: UnionTypeNode['children'] = {};

    for (const childNode of childrenList) {
        const childNodeList = childNode.type === 'union' ? objectValues(childNode.children) : [childNode];
        for (const childNode of childNodeList) {
            if (childNode.type === 'array') {
                mergedChildren[childNode.type] = mergeTypeNode(mergedChildren[childNode.type], childNode);
            } else if (childNode.type === 'record') {
                mergedChildren[childNode.type] = mergeTypeNode(mergedChildren[childNode.type], childNode);
            } else if (childNode.type === 'string') {
                mergedChildren[childNode.type] = mergeTypeNode(mergedChildren[childNode.type], childNode);
            } else {
                mergedChildren[childNode.type] = mergeTypeNode(mergedChildren[childNode.type], childNode);
            }
        }
    }

    return {
        type: 'union',
        children: mergedChildren,
    };
}

/**
 * 内容が空の各`TypeNode`型値を作成する
 */
export function createEmptyTypeNode<T extends Exclude<TypeNode, UnionTypeNode>['type']>(
    type: T,
): Extract<TypeNode, { type: T }>;
export function createEmptyTypeNode(type: Exclude<TypeNode, UnionTypeNode>['type']): Exclude<TypeNode, UnionTypeNode> {
    if (type === 'undefined' || type === 'boolean' || type === 'string') {
        return createPrimitiveTypeNode(type);
    } else if (type === 'array') {
        return createArrayTypeNode(createUndefinedTypeNode());
    } else if (type === 'record') {
        return createRecordTypeNode({});
    }
    throw new Error(`Unknown type argument: "${type as string}"`);
}

/**
 * 第1引数`node`に指定された`TypeNode`型の値から、第2引数`type`で指定されたタイプと一致する`TypeNode`型の値を返す。
 * 第1引数`node`の値が`UnionTypeNode`型の場合は、内包する`TypeNode`型の値の中から取得する。
 * 取得に失敗した場合は、`undefined`を返す。
 */
export function getTypeNodeByTypeName<T extends TypeNodeTypes>(
    node: TypeNode,
    type: T,
): Extract<TypeNode, { type: T }> | undefined;
export function getTypeNodeByTypeName(node: TypeNode, type: TypeNodeTypes): TypeNode | undefined {
    if (node.type === type) return node;
    if (node.type === 'union' && type !== 'union' && type !== 'undefined') return node.children[type];
    return undefined;
}

/**
 * 2つの`TypeNode`型の値をマージし、`UnionTypeNode`ノードに変換する
 * @throws マージ不可能な型の場合は、`Error`を投げる
 */
export function mergeTypeNode<T extends TypeNode>(node1: T | undefined, node2: T): T;
export function mergeTypeNode(node1: TypeNode | undefined, node2: TypeNode): TypeNode {
    if (!node1 || node1.type === 'undefined') return node2;
    if (node2.type === 'undefined') return node1;
    if (node1.type !== node2.type || node1.type === 'union' || node2.type === 'union') {
        return createUnionTypeNode([node1, node2]);
    }
    if (node1.type === node2.type && (node1.type === 'boolean' || node1.type === 'string')) return node1;
    if (node1.type === 'array' && node2.type === 'array') {
        return createArrayTypeNode(mergeTypeNode(node1.children, node2.children));
    }
    if (node1.type === 'record' && node2.type === 'record') {
        const mergedChildren: TypeNodeRecord = { ...node1.children };
        for (const [prop, valueNode] of objectEntries(node2.children)) {
            mergedChildren[prop] = mergeTypeNode(mergedChildren[prop], valueNode);
        }
        return createRecordTypeNode(mergedChildren);
    }
    throw new Error(`Cannot merge type "${node1.type}" and type "${node2.type}"`);
}
