<script lang="ts">
  import 'codemirror/mode/xml/xml';

  import type { EventMap } from './components/CodeMirror.svelte';
  import CodeMirror from './components/CodeMirror.svelte';
  import TabList from './components/TabList.svelte';
  import TemplateEditor from './components/TemplateEditor.svelte';
  import TemplateError from './components/TemplateError.svelte';
  import VariableInput from './components/VariableInput.svelte';
  import {
    templateText as defaultTemplateText,
    variablesRecord as defaultVariablesRecord,
  } from './data/default';
  import Handlebars from './handlebars';
  import { downloadFile, pickFile } from './utils/dom';
  import { getVariableTypeStructure } from './utils/handlebars';
  import type { TypeNode } from './utils/handlebars/node';

  function render(
    template: typeof compiledTemplate,
    context: unknown,
  ): { html: string } | { html?: undefined; error: unknown } {
    try {
      return { html: template(context) };
    } catch (error) {
      return { error };
    }
  }

  let variablesContext: unknown = defaultVariablesRecord;
  let templateText: string = defaultTemplateText;

  let variableTypeStructure: TypeNode | undefined;
  $: {
    try {
      variableTypeStructure = getVariableTypeStructure(templateText);
    } catch {}
  }

  let compiledTemplate: Handlebars.TemplateDelegate;
  $: compiledTemplate = Handlebars.compile(templateText);

  let outputData: ReturnType<typeof render>;
  $: outputData = render(compiledTemplate, variablesContext);

  let templateAreaTab: null | 'L' | 'R' = 'R';

  const handleChangeTabList = (
    areaType: Exclude<typeof templateAreaTab, null>,
  ) => (event: CustomEvent<{ value: string }>) => {
    if (event.detail.value === 'テンプレート') {
      templateAreaTab = areaType;
    } else if (templateAreaTab === areaType) {
      templateAreaTab = null;
    }
  };
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

        if (
          confirm(
            `現在の変数の入力を消去し、ファイルで指定された変数で上書きします。よろしいですか？`,
          )
        ) {
          variablesContext = data;
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
    downloadFile({
      filename: 'variables.json',
      contents: JSON.stringify(variablesContext, null, 2),
      mime: 'application/json',
    });
  };
  const handleExportHTML = (htmlText: string) => () =>
    downloadFile({
      filename: 'result.html',
      contents: htmlText,
      mime: 'text/html',
    });
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
  <div class="left-area">
    <TabList
      class="tab-list"
      valueList={['テンプレート', '変数']}
      value={templateAreaTab === 'L' ? 'テンプレート' : '変数'}
      on:change={handleChangeTabList('L')}
    />
    {#if templateAreaTab === 'L'}
      <TemplateEditor editorClass="template-editor" bind:value={templateText} />
    {:else if templateAreaTab === 'R' && 'error' in outputData}
      <TemplateError class="error" error={outputData.error} />
    {:else}
      <div class="variables-input-area">
        {#if variableTypeStructure}
          <VariableInput
            typeStructure={variableTypeStructure}
            bind:value={variablesContext}
          />
        {/if}
      </div>
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
    {/if}
  </div>
  <div class="right-area">
    <TabList
      class="tab-list"
      valueList={['テンプレート', 'HTML']}
      value={templateAreaTab === 'R' ? 'テンプレート' : 'HTML'}
      on:change={handleChangeTabList('R')}
    />
    {#if templateAreaTab === 'R'}
      <TemplateEditor editorClass="template-editor" bind:value={templateText} />
    {:else if outputData.html !== undefined}
      <CodeMirror
        mode="text/html"
        readonly
        value={outputData.html}
        lineWrapping
        on:focus={handleSelectAll}
        class="output-html-editor"
      />
      <p class="html-export-area">
        <input
          type="button"
          value="HTMLをエクスポート"
          on:click={handleExportHTML(outputData.html)}
        />
      </p>
    {:else}
      <TemplateError class="error" error={outputData.error} />
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

  :global(html),
  * :global(.tab-list) {
    background-color: white;
    color: black;
  }

  main {
    display: flex;
    box-sizing: border-box;
    border-top: solid 1px #ccc;
    border-bottom: solid 1px #ccc;
  }

  .left-area,
  .right-area {
    flex: 1;
    width: 50%;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
  }

  /* コンポーネント内のスタイルを上書きするためには、クラスセレクターを重ねて詳細度を上げる必要がある */
  .left-area > :global(.tab-list.tab-list.tab-list),
  .right-area > :global(.tab-list.tab-list.tab-list) {
    margin-top: 0.5em;
  }

  .left-area {
    border-right: solid 1px #ccc;
  }

  .variables-input-area,
  * :global(.template-editor),
  * :global(.output-html-editor),
  * :global(.error) {
    flex: 1;
  }

  .variables-input-area {
    overflow-y: auto;
    padding: 0.5em;
  }

  .variables-import-export-area,
  .html-export-area {
    margin: 0;
    border-top: solid 1px #ccc;
    text-align: right;
  }

  .variables-import-export-area,
  .html-export-area {
    padding: 0.5em;
    text-align: right;
  }

  .variables-import-export-area input[type='button'] + input[type='button'] {
    margin-left: 0.5em;
  }
</style>
