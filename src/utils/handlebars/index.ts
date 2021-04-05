import hbs from 'handlebars';

import { isSingleTuple, mergeSet } from '..';
import type * as HandlebarsAST from './ast';
import { isMatchType } from './ast';
import type { TypeNode, TypeNodeRecord } from './node';
import { NodeStream, PathList } from './node/stream';

interface ContextPaths {
    readonly default: PathList;
    readonly aliasNameRecord: Readonly<Record<string, PathList>>;
    readonly ignoreNameSet?: ReadonlySet<string>;
}

export function getVariableRecord(template: string): TypeNodeRecord {
    const nodeStream = new NodeStream();
    const ast = hbs.parse(template);
    const node = assignAST2node(ast, nodeStream, { default: [], aliasNameRecord: {} });

    if (node.type === 'record') {
        return node.children;
    } else if (node.type === 'undefined') {
        return {};
    } else {
        return { '': node };
    }
}

/**
 * HandlebarsのASTノードの解析結果を`NodeStream`に代入する
 */
function assignAST2node(
    astNode: HandlebarsAST.AllNode,
    nodeStream: NodeStream,
    currentContext: ContextPaths,
): TypeNode {
    if (isMatchType(astNode, 'Program')) {
        for (const statementNode of astNode.body) {
            assignAST2node(statementNode, nodeStream, currentContext);
        }
    } else if (isMatchType(astNode, 'MustacheStatement')) {
        /**
         * {{ foo }}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: StringTypeNode
         *   }
         * }
         *
         *
         * {{ foo.bar }}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: RecordTypeNode {
         *       children: {
         *         bar: StringTypeNode
         *       }
         *     }
         *   }
         * }
         *
         *
         * {{ this }}
         * ↓
         * StringTypeNode
         *
         *
         * {{ this.hoge }}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     hoge: StringTypeNode
         *   }
         * }
         */
        const pathList = pathExpressionAST2pathList(astNode.path, currentContext);
        if (pathList) nodeStream.add(pathList, 'string');
    } else if (isMatchType(astNode, 'BlockStatement')) {
        const blockHelperName = astNode.path.original;
        if (blockHelperName === 'if' || blockHelperName === 'unless') {
            assignIfBlockAST2node(astNode, nodeStream, currentContext);
        } else if (blockHelperName === 'each') {
            assignEachBlockAST2node(astNode, nodeStream, currentContext);
        } else if (blockHelperName === 'with') {
            assignWithBlockAST2node(astNode, nodeStream, currentContext);
        }
    }
    return nodeStream.node;
}

/**
 * Handlebarsの{@link https://handlebarsjs.com/guide/builtin-helpers.html#if ビルトイン・ブロック・ヘルパー`#if`}および{@link https://handlebarsjs.com/guide/builtin-helpers.html#unless `#unless`}を示す`BlockStatement`ASTノードの解析結果を`NodeStream`に代入する
 */
function assignIfBlockAST2node(
    astNode: HandlebarsAST.BlockStatement,
    nodeStream: NodeStream,
    currentContext: ContextPaths,
): void {
    /**
     * 以下のテンプレートが指定された場合の、`foo`に相当する`PathExpression`ASTノード、または、`Literal`ASTノード
     * ```handlebars
     * {{#if foo}} ... {{/if}}
     * ```
     * ```handlebars
     * {{#unless foo}} ... {{/if}}
     * ```
     */
    const conditionalParam = astNode.params[0];
    if (!conditionalParam) {
        /**
         * 第一引数が未定義の場合は、`#if`および`#unless`はエラーを投げて失敗する。
         * このため、第一引数が未定義の場合は、何もせずに終了する
         */
        return;
    }

    /**
     * 以下のテンプレートが指定された場合の、`foo`に相当する`PathList`型の値
     * ```handlebars
     * {{#if foo}} ... {{/if}}
     * ```
     * ```handlebars
     * {{#unless foo}} ... {{/if}}
     * ```
     * 値が`null`の場合は、該当の箇所に`Literal`ASTノードが指定されていたため`PathList`型への変換に失敗している
     */
    const conditionalPathList = pathExpressionAST2pathList(conditionalParam, currentContext);

    /**
     * 第一引数に指定されていた式が変数名だった場合は、boolean型の値として`NodeStream`に代入する
     */
    if (conditionalPathList) {
        nodeStream.add(conditionalPathList, 'boolean');
    }

    /**
     * `if`ブロックの内容を解析する
     */
    assignAST2node(astNode.program, nodeStream, currentContext);

    /**
     * `else`ブロックの内容を解析する
     */
    if (astNode.inverse) {
        assignAST2node(astNode.inverse, nodeStream, currentContext);
    }
}

/**
 * Handlebarsの{@link https://handlebarsjs.com/guide/builtin-helpers.html#each ビルトイン・ブロック・ヘルパー`#each`}を示す`BlockStatement`ASTノードの解析結果を`NodeStream`に代入する
 */
function assignEachBlockAST2node(
    astNode: HandlebarsAST.BlockStatement,
    nodeStream: NodeStream,
    currentContext: ContextPaths,
): void {
    /**
     * 以下のテンプレートが指定された場合の、`foo`に相当する`PathList`型の値
     * ```handlebars
     * {{#each foo}} ... {{/each}}
     * ```
     */
    const parentContextPathList = astNode.params[0] && pathExpressionAST2pathList(astNode.params[0], currentContext);
    if (!parentContextPathList) return;
    const contextPathList = parentContextPathList.concat(NodeStream.arrayIndex);
    /**
     * 以下のテンプレートが指定された場合の、`hoge`や`fuga`に対応する値の配列
     * ```handlebars
     * {{#each foo as |hoge fuga|}} ... {{/each}}
     * ```
     */
    const blockParams = astNode.program.blockParams as (typeof astNode.program.blockParams | undefined);
    /**
     * 以下のテンプレートが指定された場合の、`hoge`に相当する`string`型の値
     * ```handlebars
     * {{#each foo as |hoge|}} ... {{/each}}
     * ```
     */
    const contextName = blockParams?.[0];

    nodeStream.add(parentContextPathList, 'array');

    const childContext: ContextPaths = {
        ...currentContext,
        default: contextPathList,
        ...blockParams && blockParams.length > 0
            ? { ignoreNameSet: mergeSet(currentContext.ignoreNameSet, blockParams) }
            : {},
    };
    if (typeof contextName === 'string') {
        /**
         * {{#each foo as |bar|}} {{bar.hoge}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: RecordTypeNode {
         *         children: {
         *           hoge: StringTypeNode
         *         }
         *       }
         *     }
         *   }
         * }
         *
         *
         * {{#each foo as |bar|}} {{this.baz}} {{bar.hoge}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: RecordTypeNode {
         *         children: {
         *           baz: StringTypeNode,
         *           hoge: StringTypeNode
         *         }
         *       }
         *     }
         *   }
         * }
         *
         *
         * {{#each foo as |bar|}} {{this.hoge}} {{bar}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: UnionTypeNode {
         *         children: {
         *           string: StringTypeNode,
         *           record: RecordTypeNode {
         *             children: {
         *               hoge: StringTypeNode
         *             }
         *           }
         *         }
         *       }
         *     }
         *   }
         * }
         *
         *
         * {{#each foo as |bar|}} {{this.baz}} {{hoge}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: RecordTypeNode {
         *         children: {
         *           baz: StringTypeNode,
         *           hoge: StringTypeNode
         *         }
         *       }
         *     }
         *   }
         * }
         *
         *
         * {{#each foo as |bar barID|}} {{bar.hoge}} {{barID}} {{fuga}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: RecordTypeNode {
         *         children: {
         *           hoge: StringTypeNode
         *           fuga: StringTypeNode
         *         }
         *       }
         *     }
         *   }
         * }
         */
        assignAST2node(astNode.program, nodeStream, {
            ...childContext,
            aliasNameRecord: {
                ...currentContext.aliasNameRecord,
                [contextName]: contextPathList,
            },
        });
    } else {
        /**
         * {{#each foo}} {{hoge}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: RecordTypeNode {
         *         children: {
         *           hoge: StringTypeNode
         *         }
         *       }
         *     }
         *   }
         * }
         *
         *
         * {{#each foo}} {{this}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: StringTypeNode
         *     }
         *   }
         * }
         *
         *
         * {{#each foo}} {{this.bar}} {{hoge}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: RecordTypeNode {
         *         children: {
         *           bar: StringTypeNode,
         *           hoge: StringTypeNode
         *         }
         *       }
         *     }
         *   }
         * }
         *
         *
         * {{#each foo}} {{this}} {{hoge}} {{/each}}
         * ↓
         * RecordTypeNode {
         *   children: {
         *     foo: ArrayTypeNode {
         *       children: UnionTypeNode {
         *         children: {
         *           string: StringTypeNode,
         *           record: RecordTypeNode {
         *             children: {
         *               hoge: StringTypeNode
         *             }
         *           }
         *         }
         *       }
         *     }
         *   }
         * }
         */
        assignAST2node(astNode.program, nodeStream, childContext);
    }

    /**
     * `else`ブロックの内容を解析する
     */
    if (astNode.inverse) {
        assignAST2node(astNode.inverse, nodeStream, currentContext);
    }
}

/**
 * Handlebarsの{@link https://handlebarsjs.com/guide/builtin-helpers.html#with ビルトイン・ブロック・ヘルパー`#with`}を示す`BlockStatement`ASTノードの解析結果を`NodeStream`に代入する
 */
function assignWithBlockAST2node(
    astNode: HandlebarsAST.BlockStatement,
    nodeStream: NodeStream,
    currentContext: ContextPaths,
): void {
    if (!isSingleTuple(astNode.params)) return;
    /**
     * 以下のテンプレートが指定された場合の、`foo`に対応する値
     * ```handlebars
     * {{#with foo}} ... {{/with}}
     * ```
     */
    const contextPathList = pathExpressionAST2pathList(astNode.params[0], currentContext);
    if (!contextPathList) return;

    /**
     * 以下のテンプレートが指定された場合の、`hoge`や`fuga`に対応する値の配列
     * ```handlebars
     * {{#with foo as |hoge fuga|}} ... {{/with}}
     * ```
     */
    const blockParams = astNode.program.blockParams as (typeof astNode.program.blockParams | undefined);
    /**
     * 以下のテンプレートが指定された場合の、`hoge`に対応する値
     * ```handlebars
     * {{#with foo as |hoge|}} ... {{/with}}
     * ```
     */
    const contextName = blockParams?.[0];

    nodeStream.add(contextPathList, 'record');

    const childContext: ContextPaths = {
        ...currentContext,
        default: contextPathList,
        ...blockParams && blockParams.length > 0
            ? { ignoreNameSet: mergeSet(currentContext.ignoreNameSet, blockParams) }
            : {},
    };
    assignAST2node(
        astNode.program,
        nodeStream,
        typeof contextName === 'string'
            ? {
                ...childContext,
                aliasNameRecord: {
                    ...currentContext.aliasNameRecord,
                    [contextName]: contextPathList,
                },
            }
            : childContext,
    );

    /**
     * `else`ブロックの内容を解析する
     */
    if (astNode.inverse) {
        assignAST2node(astNode.inverse, nodeStream, currentContext);
    }
}

/**
 * Handlebarsの変数を示す`PathExpression`ASTノードを`PathList`型の配列に変換する
 *
 * @param ignoreAtData
 * `@key`や`@index`のような{@link https://handlebarsjs.com/api-reference/data-variables.html `@data`変数}を無視する
 * @returns
 * 以下のいずれかの場合は`null`。それ以外の場合は`PathList`型の配列値
 * + 第一引数`astNode`の値が`PathExpression`ASTノードではない
 * + 第三引数`ignoreAtData`の値が`true`で、かつ、対象の変数が{@link https://handlebarsjs.com/api-reference/data-variables.html `@data`変数}である
 * + 変数名の最初の識別子が`currentContext.ignoreNameSet`に含まれている場合
 *   これは、以下の例示において、変数`userId`を無視するために存在する：
 *   ```handlebars
 *   {{#each users as |user userId|}}
 *     Id: {{userId}} Name: {{user.name}}
 *   {{/each}}
 *   ```
 */
function pathExpressionAST2pathList(
    astNode: HandlebarsAST.AllNode,
    currentContext: ContextPaths,
    ignoreAtData = true,
): PathList | null {
    if (!isMatchType(astNode, 'PathExpression') || (ignoreAtData && astNode.data)) return null;

    if (!isSelfPathAST(astNode)) {
        const [firstPart, ...secondParts] = astNode.parts;
        if (typeof firstPart === 'string') {
            const aliasNamedContext = currentContext.aliasNameRecord[firstPart];
            if (aliasNamedContext) {
                /**
                 * {{ foo }}
                 * ↓
                 * currentContext.aliasNameRecord['foo']
                 *   if currentContext.aliasNameRecord['foo'] is defined
                 *
                 * {{ foo.bar }}
                 * or
                 * {{ foo/bar }}
                 * ↓
                 * [...currentContext.aliasNameRecord['foo'], 'bar']
                 *   if currentContext.aliasNameRecord['foo'] is defined
                 *
                 * {{ foo.bar.baz }}
                 * or
                 * {{ foo/bar/baz }}
                 * ↓
                 * [...currentContext.aliasNameRecord['foo'], 'bar', 'baz']
                 *   if currentContext.aliasNameRecord['foo'] is defined
                 */
                return aliasNamedContext.concat(secondParts);
            }

            /**
             * {{ this_var_is_non_exists }}
             * ↓
             * null
             *   if currentContext.ignoreNameSet is defined
             *      and
             *      currentContext.ignoreNameSet has 'this_var_is_non_exists'
             */
            if (currentContext.ignoreNameSet?.has(firstPart)) return null;
        }
    }

    /**
     * {{ foo }}
     * ↓
     * [...currentContext.default, 'foo']
     *
     * {{ this }}
     * or
     * {{ . }}
     * ↓
     * currentContext.default
     *
     * {{ foo.bar }}
     * or
     * {{ foo/bar }}
     * ↓
     * [...currentContext.default, 'foo', 'bar']
     *
     * {{ this.hoge }}
     * or
     * {{ this/hoge }}
     * ↓
     * [...currentContext.default, 'hoge']
     */
    return currentContext.default.concat(astNode.parts);
}

/**
 * 指定された`PathExpression`ASTノードが、相対的な変数名を参照するものであるかを判定する。
 * 具体的には、以下のような変数名の場合に、`true`を返す。
 * ```handlebars
 * {{ this.foo }}
 * {{ this/foo }}
 * {{ ./foo }}
 * ```
 *
 * Note: {@link https://handlebarsjs.com/guide/expressions.html#literal-segments segment-literal notation}を使用した以下のような変数名は、相対的な参照*ではない*はずである。
 * ```handlebars
 * {{ [this].foo }}
 * {{ [this]/foo }}
 * {{ [.].foo }}
 * {{ [.]/foo }}
 * ```
 * しかし、`handlebars@4.7.7`は、これを相対的な参照の変数名として処理する。
 * おそらくHandlebarsのバグだと思われるが、実際の動作に合わせるため、意図的に修正は行わない。
 *
 * @returns `true`の場合は、変数が相対的な参照であることを示す
 */
function isSelfPathAST(pathExpressionASTNode: HandlebarsAST.PathExpression): boolean {
    return /^(?:this[./]|\.\/)/.test(pathExpressionASTNode.original);
}
