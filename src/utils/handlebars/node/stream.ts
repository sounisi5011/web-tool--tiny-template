// - ノードを動的に追加するメソッド
// - ある値の変数名（コンテキスト）を追加するメソッド
// - 変数名から値を引っ張るメソッド（追加時に指定可能にする？）

import {
    createEmptyTypeNode,
    createUndefinedTypeNode,
    getTypeNodeByTypeName,
    mergeTypeNode,
    TypeNode,
    TypeNodeTypes,
} from '.';

const arrayIndexSymbol = Symbol('ArrayIndex');

export type PathItem = string | typeof arrayIndexSymbol;
export type PathList = readonly PathItem[];

export class NodeStream {
    static arrayIndex: typeof arrayIndexSymbol = arrayIndexSymbol;

    public node: TypeNode = createUndefinedTypeNode();

    public add(path: PathList, type: Exclude<TypeNodeTypes, 'union' | 'undefined'>): void {
        let currentNode = this.node;
        let updateNode = (newNode: TypeNode): void => {
            this.node = newNode;
        };

        for (const pathName of path) {
            if (pathName === NodeStream.arrayIndex) {
                let arrayNode_ = getTypeNodeByTypeName(currentNode, 'array');
                if (!arrayNode_) {
                    const newArrayNode = createEmptyTypeNode('array');
                    const mergedNode = mergeTypeNode(currentNode, newArrayNode);
                    updateNode(mergedNode);
                    arrayNode_ = newArrayNode;
                }

                const arrayNode = arrayNode_;
                currentNode = arrayNode.children;
                updateNode = newNode => {
                    arrayNode.children = newNode;
                };
            } else {
                let recordNode = getTypeNodeByTypeName(currentNode, 'record');
                if (!recordNode) {
                    const newRecordNode = createEmptyTypeNode('record');
                    const mergedNode = mergeTypeNode(currentNode, newRecordNode);
                    updateNode(mergedNode);
                    recordNode = newRecordNode;
                }

                const childNodeRecord = recordNode.children;
                currentNode = childNodeRecord[pathName] ?? createUndefinedTypeNode();
                updateNode = newNode => {
                    childNodeRecord[pathName] = newNode;
                };
            }
        }

        const newNode = createEmptyTypeNode(type);
        const mergedNode = mergeTypeNode(currentNode, newNode);
        updateNode(mergedNode);
    }
}
