<div class=input-area>
  <div class=input-variables-area>
    {#each [...variablesList] as variable}
    <fieldset>
      <legend><input type=text bind:value={variable.name}></legend>
      <input type=text bind:value={variable.value}>
    </fieldset>
    {/each}
    <p class=add-button><input type=button value=追加></p>
  </div>
  <div class=input-template-area>
    <textarea bind:value={templateText}></textarea>
  </div>
</div>
<div class=output-area>
  <textarea readonly>{templateText}</textarea>
</div>

<script>
  const variablesList = [
    { name: 'title', value: 'ゲト博士' },
    { name: 'せつめい', value: 'ドフェチいモフモフキャラだよ♥' },
  ];
  let templateText = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{ title }}</title>
  </head>
  <body>
    <main>{{ せつめい }}</main>
  </body>
</html>`;
</script>
