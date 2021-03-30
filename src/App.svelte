<script lang="ts">
  import 'codemirror/mode/xml/xml';
  import Mustache from 'mustache';

  import './codemirror-mode/mustache';
  import type { EventMap } from './components/CodeMirror.svelte';
  import CodeMirror from './components/CodeMirror.svelte';
  import VariableInput from './components/VariableInput.svelte';
  import { triggerEnter, downloadFile, pickFile } from './utils/dom';
  import { getVariableNameList } from './utils/mustache';
  import { validateVariableRecord } from './utils/variable-data';

  type VariableData = {
    name: string;
    value?: string;
    focusValue?: boolean;
    duplicate: boolean;
  };
  type VariablesList = ReadonlyArray<VariableData>;

  function variablesList2variablesObj(
    variablesList: VariablesList,
  ): Record<string, string> {
    return Object.fromEntries(
      variablesList.map(({ name, value }) => [name, value ?? '']),
    );
  }

  function render(
    template: string,
    variablesList: VariablesList,
  ): string | null {
    const variables = variablesList2variablesObj(variablesList);
    try {
      return Mustache.render(template, variables);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  function existsVariableName(
    variableName: string,
    varList: VariablesList = variablesList,
  ): boolean {
    return Boolean(varList.find(({ name }) => name === variableName));
  }

  function removeEmptyVariables(): VariablesList {
    return variablesList.filter((variable) => variable.value !== undefined);
  }

  function findDuplicateVariables(
    variablesList: ReadonlyArray<Omit<VariableData, 'duplicate'>>,
  ): VariablesList {
    const nameMap = new Map<string, Set<Omit<VariableData, 'duplicate'>>>();
    for (const variable of variablesList) {
      const objSet = nameMap.get(variable.name) ?? new Set();
      objSet.add(variable);
      nameMap.set(variable.name, objSet);
    }
    return variablesList.map((variable) => {
      const size = nameMap.get(variable.name)?.size ?? 1;
      return { ...variable, duplicate: size > 1 };
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
        ...[...definedVariableNameSet]
          .filter(
            (varName) => !existsVariableName(varName, removedVariablesList),
          )
          .map((varName) => ({ name: varName })),
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  let outputHTMLText: ReturnType<typeof render>;
  $: outputHTMLText = render(templateText, variablesList);

  const handleImportVariables = () => {
    pickFile({ accept: '.json' }, (file) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const { result } = reader;
        if (typeof result !== 'string') {
          alert(
            `ファイルの読み込みが失敗しました。FileReaderオブジェクトが、文字列ではない結果を返しました`,
          );
          return;
        }

        let data: unknown;
        try {
          data = JSON.parse(result);
        } catch (error) {
          alert(
            `ファイルの読み込みが失敗しました。指定されたファイルは適切なJSONではありません:\n  ${error}`,
          );
          return;
        }

        if (!validateVariableRecord(data)) {
          alert(`ファイルの読み込みが失敗しました。指定されたファイルは適切なデータ形式ではありません。以下のような形式のJSONデータを指定してください:
  {
    "変数名1": "値",
    "変数名2": 42,
    "変数名3": true,
    "変数名4": null
  }`);
          return;
        }

        if (
          confirm(
            `現在の変数の入力を消去し、ファイルで指定された変数で上書きします。よろしいですか？`,
          )
        ) {
          variablesList = findDuplicateVariables(
            Object.entries(data).map(([name, value]) => ({
              name,
              value: String(value),
            })),
          );
        }
      });
      reader.addEventListener('error', () => {
        alert(`ファイルの読み込みが失敗しました:\n  ${reader.error}`);
      });
      reader.addEventListener('abort', () => {
        alert(`ファイルの読み込みが中断されました`);
      });
      reader.readAsText(file);
    });
  };
  const handleExportVariables = () => {
    const variables = variablesList2variablesObj(variablesList);
    downloadFile({
      filename: 'variables.json',
      contents: JSON.stringify(variables, null, 2),
      mime: 'application/json',
    });
  };
  const handleRemoveVariable = (variable: VariableData) => () => {
    variablesList = findDuplicateVariables(
      variablesList.filter((valData) => valData !== variable),
    );
  };
  const handleAddVariable = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    if (newVariableName !== '' && !existsVariableName(newVariableName)) {
      variablesList = variablesList.concat({
        name: newVariableName,
        value: '',
        duplicate: false,
        focusValue: true,
      });
      newVariableName = '';
    }
  };
  const handleSelectAll = (
    event: { currentTarget: HTMLTextAreaElement } | EventMap['focus'],
  ) => {
    if ('detail' in event) {
      const instance = event.detail.instance;
      instance.execCommand('selectAll');
    } else {
      event.currentTarget.select();
    }
  };
</script>

<main>
  <div class="input-area">
    <div class="input-variables-area">
      {#each variablesList as variable}
        <div class="variable-input">
          <VariableInput
            bind:name={variable.name}
            bind:value={variable.value}
            bind:autofocusValue={variable.focusValue}
            defined={definedVariableNameSet.has(variable.name)}
            duplicate={variable.duplicate}
            on:remove={handleRemoveVariable(variable)}
          />
        </div>
      {/each}
      <p class="add-variables-area">
        <input
          type="text"
          class="variable-name"
          bind:value={newVariableName}
          placeholder="新しい変数の名前"
          on:keydown={triggerEnter(handleAddVariable)}
        />
        <input
          type="button"
          value="追加"
          on:click={handleAddVariable}
          disabled={newVariableName === '' ||
            existsVariableName(newVariableName)}
        />
      </p>
      <p class="variables-import-export-area">
        <input
          type="button"
          value="変数をJSONからインポート"
          on:click={handleImportVariables}
        />
        <input
          type="button"
          value="変数をJSONにエクスポート"
          on:click={handleExportVariables}
        />
      </p>
    </div>
    <div class="input-template-area">
      <CodeMirror
        mode="mustache"
        bind:value={templateText}
        placeholder="テンプレートを入力"
        lineWrapping
        class="editor"
      />
    </div>
    <p class="input-template-help">
      テンプレートの言語は
      <a href="http://mustache.github.io/" target="_blank">Mustache</a>
      です。
    </p>
  </div>
  <div class="output-area">
    {#if typeof outputHTMLText === 'string'}
      <CodeMirror
        mode="text/html"
        readonly
        value={outputHTMLText}
        lineWrapping
        on:focus={handleSelectAll}
        class="editor"
      />
    {:else}
      <strong class="error">テンプレートの変換が失敗しました。</strong>
    {/if}
  </div>
</main>

<style>
  :global(html),
  :global(body),
  main {
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
    padding: 0.5em;
  }

  .input-variables-area .variable-input,
  .input-variables-area .add-variables-area,
  .input-variables-area .variables-import-export-area {
    margin: 0.5em 0 0;
  }

  .input-variables-area .variable-input:first-child,
  .input-variables-area .add-variables-area:first-child,
  .input-variables-area .variables-import-export-area:first-child {
    margin-top: 0;
  }

  .input-variables-area .add-variables-area {
    float: left;
  }

  .input-variables-area .variables-import-export-area {
    float: right;
  }

  .input-variables-area
    .variables-import-export-area
    input[type='button']
    + input[type='button'] {
    margin-left: 0.5em;
  }

  .input-template-area {
    flex: 1;
    overflow-y: auto;
  }

  .input-template-area :global(.editor),
  .output-area :global(.editor) {
    width: 100%;
    height: 100%;
  }

  .input-template-help {
    margin: 0.5em 0;
    text-align: right;
    font-size: smaller;
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
