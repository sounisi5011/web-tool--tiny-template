export const templateText = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{ キャラ名.日 }}</title>
  </head>
  <body>
    <h1>{{ キャラ名.日 }}{{#if キャラ名.英}} <span lang="en">{{ キャラ名.英 }}</span>{{/if}}</h1>

    <h2>Data</h2>
    <div>
    {{#each 情報}}
      <p>{{種類}}：{{内容}}</p>
    {{/each}}
    </div>

    {{#each 文章}}
    <h2>{{タイトル}}</h2>
    <p>{{内容}}</p>
    {{/each}}
  </body>
</html>`;
export const variablesRecord = {
    キャラ名: {
        日: 'てすと',
        英: 'Test',
    },
    情報: [
        {
            種類: '身長',
            内容: '178cm',
        },
    ],
    文章: [
        {
            タイトル: 'Story',
            内容: '私は誰だ？私は何だ？私は…一体…？',
        },
    ],
};
