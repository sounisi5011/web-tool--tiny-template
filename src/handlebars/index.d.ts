/**
 * handlebars@4.7.7と@rollup/plugin-node-resolve@11.2.0は相性が悪く、
 * handlebarsの`browser`フィールドが適切に認識されないため、
 * ブラウザ用のhandlebarsファイルのための型定義を再エクスポートする。
 */
export * from 'handlebars';
export { default } from 'handlebars';
