/**
 * handlebars@4.7.7と@rollup/plugin-node-resolve@11.2.0は相性が悪く、
 * handlebarsの`browser`フィールドが適切に認識されないため、
 * ブラウザ用のhandlebarsを手動で再エクスポートする。
 */

module.exports = require('handlebars/dist/handlebars.js');
// module.exports = require('handlebars/dist/handlebars.min.js'); // 圧縮版。terserとの相性のせいか、生成結果が非圧縮版より 111 bytes 大きくなるため却下
// module.exports = require('handlebars/dist/cjs/handlebars.js'); // `browser`フィールドに記載されていたパス。生成結果が 23208 bytes (22.6 KiB) もデカくなるため却下
