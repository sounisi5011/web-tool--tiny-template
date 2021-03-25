<script lang="ts">
  import Mustache from 'mustache';
  import {getVariableNameList} from './utils/mustache'
  import {triggerEnter} from './utils/dom'
  import VariableInput from './components/VariableInput.svelte';

  type VariableData = { name: string; value?: string, focusValue?: boolean, duplicate: boolean };
  type VariablesList = ReadonlyArray<VariableData>;

  function render(template: string, variablesList: VariablesList): string | null {
    const variables = Object.fromEntries(variablesList.map(({name,value}) => [name,value]));
    try {
      return Mustache.render(template, variables);
    } catch(e) {
      console.error(e);
      return null;
    }
  }

  function existsVariableName(variableName: string, varList: VariablesList = variablesList): boolean {
    return Boolean(varList.find(({ name }) => name === variableName));
  }

  function removeEmptyVariables(): VariablesList {
    return variablesList.filter(variable => variable.value !== undefined);
  }

  function findDuplicateVariables(variablesList: ReadonlyArray<Omit<VariableData, 'duplicate'>>): VariablesList {
    const nameMap = new Map<string, Set<Omit<VariableData, 'duplicate'>>>();
    for (const variable of variablesList) {
      const objSet = nameMap.get(variable.name) ?? new Set();
      objSet.add(variable);
      nameMap.set(variable.name, objSet);
    }
    return variablesList.map(variable => {
      const size = nameMap.get(variable.name)?.size ?? 1;
      return { ...variable, duplicate: 1 < size };
    });
  }

  let variablesList: VariablesList = findDuplicateVariables([
    { name: 'title', value: 'ゲト博士' },
    { name: 'せつめい', value: 'ドフェチいモフモフキャラだよ♥' },
  ]);
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
  let newVariableName = '';

  let definedVariableNameSet: Set<string>;
  $: {
    try {
      definedVariableNameSet = new Set(getVariableNameList(templateText));
      const removedVariablesList = removeEmptyVariables();
      variablesList = findDuplicateVariables([
        ...removedVariablesList,
        ...(
          [...definedVariableNameSet]
            .filter(varName => !existsVariableName(varName, removedVariablesList))
            .map(varName => ({ name: varName }))
        ),
      ]);
    } catch(e) {
      console.error(e);
    }
  }
  $: outputHTMLText = render(templateText, variablesList);

  const handleRemoveVariable = (variable: VariableData) => () => {
    variablesList = findDuplicateVariables(variablesList.filter(valData => valData !== variable));
  };
  const handleAddVariable = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    if (newVariableName !== '' && !existsVariableName(newVariableName)) {
      variablesList = variablesList.concat({ name: newVariableName, value: '', duplicate: false, focusValue: true });
      newVariableName = '';
    }
  };
</script>

<main>
  <div class=input-area>
    <div class=input-variables-area>
      {#each variablesList as variable}
        <div class=variable-input>
          <VariableInput bind:name={variable.name} bind:value={variable.value} bind:autofocusValue={variable.focusValue} defined={definedVariableNameSet.has(variable.name)} duplicate={variable.duplicate} on:remove={handleRemoveVariable(variable)} />
        </div>
      {/each}
      <p class=add-variables-area>
        <input type=text class=variable-name bind:value={newVariableName} placeholder=新しい変数の名前 on:keydown={triggerEnter(handleAddVariable)}>
        <input type=button value=追加 on:click={handleAddVariable} disabled={newVariableName === '' || existsVariableName(newVariableName)}>
      </p>
    </div>
    <div class=input-template-area>
      <textarea bind:value={templateText}></textarea>
    </div>
  </div>
  <div class=output-area>
    {#if typeof outputHTMLText === 'string'}
      <textarea readonly value={outputHTMLText} />
    {:else}
      <strong class=error>テンプレートの変換が失敗しました。</strong>
    {/if}
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

  .input-area,
  .output-area {
    flex: 1;
  }

  .input-area {
    display: flex;
    flex-direction: column;
  }

  .input-variables-area {
    height: 30%;
    overflow-y: auto;
    resize: vertical;
    padding: .5em;
  }

  .input-variables-area .variable-input,
  .input-variables-area .add-variables-area {
    margin: .5em 0 0;
  }

  .input-variables-area .variable-input:first-child,
  .input-variables-area .add-variables-area:first-child {
    margin-top: 0;
  }

  .input-template-area {
    flex: 1;
  }

  .input-template-area textarea,
  .output-area textarea {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    resize: none;
    font-family: monospace;
  }

  .output-area {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .output-area strong.error {
    color: red;
  }
</style>
