<script lang="ts">
  import Mustache from 'mustache';
  import { autoresize } from 'svelte-textarea-autoresize';
  import {getVariableNameList} from './utils/mustache'

  type VariablesList = { name: string; value?: string }[];

  function render(template: string, variablesList: VariablesList): string {
    const variables = Object.fromEntries(variablesList.map(({name,value}) => [name,value]));
    try {
      return Mustache.render(template, variables);
    } catch(e) {
      console.error(e);
      return template;
    }
  }

  const variablesList: VariablesList = [
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

  let definedVariableNameSet: Set<string>;
  $: {
    try {
      definedVariableNameSet = new Set(getVariableNameList(templateText));
      for (const varName of definedVariableNameSet) {
        if (!variablesList.find(({ name }) => name === varName)) {
          variablesList.push({ name: varName });
        }
      }
    } catch(e) {
      console.error(e);
    }
  }
  $: outputHTMLText = render(templateText, variablesList);
</script>

<main>
  <div class=input-area>
    <div class=input-variables-area>
      {#each variablesList as variable}
      <fieldset>
        <legend>
          <input type=text bind:value={variable.name}>
          {#if !definedVariableNameSet.has(variable.name)}
            <strong class=error>テンプレート内に変数が存在しません</strong>
          {/if}
        </legend>
        <textarea use:autoresize bind:value={variable.value}></textarea>
      </fieldset>
      {/each}
      <p class=add-button><input type=button value=追加></p>
    </div>
    <div class=input-template-area>
      <textarea bind:value={templateText}></textarea>
    </div>
  </div>
  <div class=output-area>
    <textarea readonly>{outputHTMLText}</textarea>
  </div>
</main>

<style>
  :global(html), :global(body), main {
    width: 100%;
    height: 100%;
    margin: 0;
  }

  main {
    display: flex;
  }

  strong.error {
    color: red;
    font-size: smaller;
  }

  .input-area,
  .output-area {
    flex: 1;
  }

  .input-area {
    display: flex;
    flex-direction: column;
  }

  .input-variables-area {
    flex: 1;
    overflow-y: auto;
    padding: .5em;
  }

  .input-variables-area fieldset,
  .input-variables-area p {
    margin: .5em 0 0;
  }

  .input-variables-area fieldset:first-child,
  .input-variables-area p:first-child {
    margin-top: 0;
  }

  .input-variables-area fieldset>legend>input[type=text] {
    color: deepskyblue;
    font-size: 75%;
  }

  .input-variables-area fieldset>textarea {
    width: 100%;
    height: 2.5em;
    min-height: 2.5em;
    resize: vertical;
  }

  .input-template-area {
    flex: 2;
  }

  .input-template-area textarea,
  .output-area textarea {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    resize: none;
    font-family: monospace;
  }
</style>
