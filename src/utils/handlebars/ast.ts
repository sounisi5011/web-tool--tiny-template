import type hbs from 'handlebars';

import type { FirstParamType } from '../type';

export type Node = FirstParamType<hbs.ICompiler['accept']>;
export type Program = FirstParamType<hbs.ICompiler['Program']>;
export type BlockStatement = FirstParamType<hbs.ICompiler['BlockStatement']>;
export type PartialStatement = FirstParamType<hbs.ICompiler['PartialStatement']>;
export type PartialBlockStatement = FirstParamType<hbs.ICompiler['PartialBlockStatement']>;
export type DecoratorBlock = FirstParamType<hbs.ICompiler['DecoratorBlock']>;
export type Decorator = FirstParamType<hbs.ICompiler['Decorator']>;
export type MustacheStatement = FirstParamType<hbs.ICompiler['MustacheStatement']>;
export type ContentStatement = FirstParamType<hbs.ICompiler['ContentStatement']>;
export type CommentStatement = FirstParamType<hbs.ICompiler['CommentStatement']>;
export type SubExpression = FirstParamType<hbs.ICompiler['SubExpression']>;
export type PathExpression = FirstParamType<hbs.ICompiler['PathExpression']>;
export type StringLiteral = FirstParamType<hbs.ICompiler['StringLiteral']>;
export type NumberLiteral = FirstParamType<hbs.ICompiler['NumberLiteral']>;
export type BooleanLiteral = FirstParamType<hbs.ICompiler['BooleanLiteral']>;
export type Hash = FirstParamType<hbs.ICompiler['Hash']>;
export type AllNode = Exclude<FirstParamType<hbs.ICompiler[keyof hbs.ICompiler]>, undefined>;

export function isMatchType<TNode extends AllNode>(astNode: TNode, type: 'Program'): astNode is Extract<Program, TNode>;
export function isMatchType<TNode extends AllNode, TType extends AllNode['type']>(
    astNode: TNode,
    type: TType,
): astNode is Extract<TNode, { type: TType }>;
export function isMatchType(astNode: AllNode, type: AllNode['type']): boolean {
    return astNode.type === type;
}
