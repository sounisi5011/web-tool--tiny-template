// - ノードを動的に追加するメソッド
// - ある値の変数名（コンテキスト）を追加するメソッド
// - 変数名から値を引っ張るメソッド（追加時に指定可能にする？）

import type {
    ArrayTypeNode,
    RecordTypeNode,
    TypeNode,
    TypeNodeRecord,
    TypeNodeTypes,
    UndefinedTypeNode,
    UnionTypeNode,
} from '.';
import { objectEntries, objectValues } from '../..';

const arrayIndexSymbol = Symbol('ArrayIndex');

export type PathItem = string | typeof arrayIndexSymbol;
export type PathList = readonly PathItem[];

export class NodeStream {
    static arrayIndex: typeof arrayIndexSymbol = arrayIndexSymbol;

    public node: TypeNode = { type: 'undefined' };

    public add(path: PathList, type: Exclude<TypeNodeTypes, 'union' | 'undefined'>): void {
        let currentNode = this.node;
        let updateNode = (newNode: TypeNode): void => {
            this.node = newNode;
        };

        for (const pathName of path) {
            if (pathName === NodeStream.arrayIndex) {
                let arrayNode_ = this.getNodeByType(currentNode, 'array');
                if (!arrayNode_) {
                    const newArrayNode = this.createEmptyNode('array');
                    const mergedNode = this.mergeNode(currentNode, newArrayNode);
                    updateNode(mergedNode);
                    arrayNode_ = newArrayNode;
                }

                const arrayNode = arrayNode_;
                currentNode = arrayNode.children;
                updateNode = newNode => {
                    arrayNode.children = newNode;
                };
            } else {
                let recordNode = this.getNodeByType(currentNode, 'record');
                if (!recordNode) {
                    const newRecordNode = this.createEmptyNode('record');
                    const mergedNode = this.mergeNode(currentNode, newRecordNode);
                    updateNode(mergedNode);
                    recordNode = newRecordNode;
                }

                const childNodeRecord = recordNode.children;
                currentNode = childNodeRecord[pathName] ?? this.createEmptyNode('undefined');
                updateNode = newNode => {
                    childNodeRecord[pathName] = newNode;
                };
            }
        }

        const newNode = this.createEmptyNode(type);
        const mergedNode = this.mergeNode(currentNode, newNode);
        updateNode(mergedNode);
    }

    private getNodeByType<T extends TypeNodeTypes>(node: TypeNode, type: T): Extract<TypeNode, { type: T }> | undefined;
    private getNodeByType(node: TypeNode, type: TypeNodeTypes): TypeNode | undefined {
        if (node.type === type) return node;
        if (node.type === 'union' && type !== 'union' && type !== 'undefined') return node.children[type];
        return undefined;
    }

    private createEmptyNode<T extends TypeNodeTypes>(type: T): Extract<TypeNode, { type: T }>;
    private createEmptyNode(type: TypeNodeTypes): TypeNode {
        if (type === 'undefined' || type === 'boolean' || type === 'string') {
            return { type };
        } else if (type === 'array') {
            return { type, children: this.createEmptyNode('undefined') };
        } else if (type === 'record' || type === 'union') {
            return { type, children: {} };
        }
        throw new Error(`Unknown type argument: "${type as string}"`);
    }

    private mergeNode<T extends TypeNode>(node1: T | undefined, node2: T): T;
    private mergeNode(node1: TypeNode | undefined, node2: TypeNode): TypeNode {
        if (!node1 || node1.type === 'undefined') return node2;
        if (node2.type === 'undefined') return node1;
        if (node1.type !== node2.type || node1.type === 'union' || node2.type === 'union') {
            return this.createUnionNode(node1, node2);
        }
        if (node1.type === node2.type && (node1.type === 'boolean' || node1.type === 'string')) return node1;
        if (node1.type === 'array' && node2.type === 'array') return this.mergeArrayNode(node1, node2);
        if (node1.type === 'record' && node2.type === 'record') return this.mergeRecordNode(node1, node2);
        throw new Error(`Cannot merge type "${node1.type}" and type "${node2.type}"`);
    }

    private mergeArrayNode(node1: ArrayTypeNode, node2: ArrayTypeNode): ArrayTypeNode {
        return {
            type: 'array',
            children: this.mergeNode(node1.children, node2.children),
        };
    }

    private mergeRecordNode(node1: RecordTypeNode, node2: RecordTypeNode): RecordTypeNode {
        const mergedChildren: TypeNodeRecord = { ...node1.children };
        for (const [prop, valueNode] of objectEntries(node2.children)) {
            mergedChildren[prop] = this.mergeNode(mergedChildren[prop], valueNode);
        }
        return {
            type: 'record',
            children: mergedChildren,
        };
    }

    private createUnionNode(
        node1: Exclude<TypeNode, UndefinedTypeNode>,
        node2: Exclude<TypeNode, UndefinedTypeNode>,
    ): UnionTypeNode {
        const mergedChildren: UnionTypeNode['children'] = {};

        for (const node of [node1, node2]) {
            const childNodeList = node.type === 'union' ? objectValues(node.children) : [node];
            for (const childNode of childNodeList) {
                switch (childNode.type) {
                    case 'array':
                        mergedChildren[childNode.type] = this.mergeNode(mergedChildren[childNode.type], childNode);
                        break;
                    case 'record':
                        mergedChildren[childNode.type] = this.mergeNode(mergedChildren[childNode.type], childNode);
                        break;
                    case 'string':
                        mergedChildren[childNode.type] = this.mergeNode(mergedChildren[childNode.type], childNode);
                        break;
                    default:
                        mergedChildren[childNode.type] = this.mergeNode(mergedChildren[childNode.type], childNode);
                }
            }
        }

        return {
            type: 'union',
            children: mergedChildren,
        };
    }
}
