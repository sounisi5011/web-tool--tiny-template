import hbs from 'handlebars';

import type * as HandlebarsAST from './ast';
import { isMatchType } from './ast';
import type { TypeNode, TypeNodeRecord } from './node';
import { NodeStream, PathList } from './node/stream';

interface ContextPaths {
    default: PathList;
    aliasName?: string;
    parentAliasNameRecord?: Record<string, PathList>;
}

export function getVariableRecord(template: string): TypeNodeRecord {
    const nodeStream = new NodeStream();
    const ast = hbs.parse(template);
    const node = assignAST2node(ast, nodeStream, { default: [] });

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
     * 以下のテンプレートが指定された場合の、`hoge`に相当する`string`型の値
     * ```handlebars
     * {{#each foo as |hoge|}} ... {{/each}}
     * ```
     */
    const contextName = astNode.program.blockParams?.[0];

    nodeStream.add(parentContextPathList, 'array');

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
         *           baz: StringTypeNode
         *         }
         *       }
         *     }
         *   }
         * }
         */
        assignAST2node(astNode.program, nodeStream, {
            default: contextPathList,
            aliasName: contextName,
            parentAliasNameRecord: typeof currentContext.aliasName === 'string'
                ? { ...currentContext.parentAliasNameRecord, [currentContext.aliasName]: currentContext.default }
                : { ...currentContext.parentAliasNameRecord },
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
        const childContext: ContextPaths = { default: contextPathList };
        if (currentContext.parentAliasNameRecord) {
            childContext.parentAliasNameRecord = { ...currentContext.parentAliasNameRecord };
        }
        if (typeof currentContext.aliasName === 'string') {
            childContext.parentAliasNameRecord = {
                ...childContext.parentAliasNameRecord,
                [currentContext.aliasName]: currentContext.default,
            };
        }
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
 * Handlebarsの変数を示す`PathExpression`ASTノードを`PathList`型の配列に変換する
 *
 * @param ignoreAtData
 * `@key`や`@index`のような{@link https://handlebarsjs.com/api-reference/data-variables.html `@data`変数}を無視する
 * @returns
 * 以下のいずれかの場合は`null`。それ以外の場合は`PathList`型の配列値
 * + 第一引数`astNode`の値が`PathExpression`ASTノードではない
 * + 第三引数`ignoreAtData`の値が`true`で、かつ、対象の変数が{@link https://handlebarsjs.com/api-reference/data-variables.html `@data`変数}である
 * + 変数のコンテキストに名前がつけられており、かつ、変数名の最初の識別子がどの別名にも一致しない。
 *   すなわち、以下の例示において、変数`this_var_is_non_exists`が該当するような状況である場合：
 *   ```handlebars
 *   {{#each hoge as |foo|}}
 *     {{ this_var_is_non_exists }}      {{! 別名`foo`と一致しないため、`null`が返され無視される }}
 *     {{ fooo.this_var_is_non_exists }} {{! 最初の識別子`fooo`が別名`foo`と一致しないため、`null`が返され無視される }}
 *     {{ this.this_var_is_exists }}     {{! 最初の識別子が`this`のため、`null`は返されず評価される }}
 *     {{#each foo.fuga as |bar|}}
 *       {{ this_var_is_non_exists }}        {{! 別名`bar`と一致しないため、`null`が返され無視される }}
 *       {{ bazzzz.this_var_is_non_exists }} {{! 最初の識別子`bazzzz`が別名`bar`とも親の別名`foo`とも一致しないため、`null`が返され無視される }}
 *       {{ bar.this_var_is_exists }}        {{! 最初の識別子`bar`は別名`bar`と一致するため、`null`は返されず評価される }}
 *       {{ foo.this_var_is_exists }}        {{! 最初の識別子`foo`は別名`bar`と一致しないが、親の別名`foo`と一致するため、`null`は返されず評価される }}
 *       {{#each bar.qux}}
 *         {{ this_var_is_exists }}         {{! 直上で別名が定義されていないため、`null`は返されず評価される }}
 *         {{ quxxxxx.this_var_is_exists }} {{! 直上で別名が定義されていないため、`null`は返されず評価される }}
 *         {{ foo.this_var_is_exists }}     {{! 最初の識別子`foo`が祖先の別名`foo`と一致するため、`null`は返されず評価される }}
 *       {{/each}}
 *     {{/each}}
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
            if (firstPart === currentContext.aliasName) {
                /**
                 * {{ foo }}
                 * ↓
                 * currentContext.default
                 *   if currentContext.aliasName === 'foo'
                 *
                 * {{ foo.bar }}
                 * or
                 * {{ foo/bar }}
                 * ↓
                 * [...currentContext.default, 'bar']
                 *   if currentContext.aliasName === 'foo'
                 */
                return currentContext.default.concat(secondParts);
            }

            const parentAliasNamedContext = currentContext.parentAliasNameRecord?.[firstPart];
            if (parentAliasNamedContext) {
                /**
                 * {{ foo }}
                 * ↓
                 * currentContext.parentAliasNameRecord['foo']
                 *   if currentContext.parentAliasNameRecord['foo'] is defined
                 *
                 * {{ foo.bar }}
                 * or
                 * {{ foo/bar }}
                 * ↓
                 * [...currentContext.parentAliasNameRecord['foo'], 'bar']
                 *   if currentContext.parentAliasNameRecord['foo'] is defined
                 */
                return parentAliasNamedContext.concat(secondParts);
            }

            /**
             * {{ this_var_is_non_exists }}
             * ↓
             * null
             *   if currentContext.aliasName is defined
             *
             * {{ foo.this_var_is_non_exists }}
             * ↓
             * null
             *   if currentContext.aliasName is defined
             *      and
             *      currentContext.parentAliasNameRecord['foo'] is not defined
             */
            if (typeof currentContext.aliasName === 'string') return null;
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
 * @returns
 * `true`の場合は、指定された変数が`this`から開始する以下のような変数
 * ```handlebars
 * {{ this.foo }}
 * {{ this/foo }}
 * {{ ./foo }}
 * ```
 */
function isSelfPathAST(pathExpressionASTNode: HandlebarsAST.PathExpression): boolean {
    return /^(?:this[./]|\.\/)/.test(pathExpressionASTNode.original);
}
