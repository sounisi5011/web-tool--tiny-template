<script lang="ts">
  import 'codemirror/mode/xml/xml';
  import 'codemirror/mode/handlebars/handlebars';

  import type { EventMap } from './components/CodeMirror.svelte';
  import CodeMirror from './components/CodeMirror.svelte';
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
    </div>
    <div class="input-template-area">
      <CodeMirror
        mode="handlebars"
        bind:value={templateText}
        placeholder="テンプレートを入力"
        lineWrapping
        class="editor"
      />
    </div>
    <p class="input-template-help">
      テンプレートの言語は
      <a href="https://handlebarsjs.com/" target="_blank">Handlebars</a>
      です。
    </p>
  </div>
  <div class="output-area">
    {#if outputData.html !== undefined}
      <CodeMirror
        mode="text/html"
        readonly
        value={outputData.html}
        lineWrapping
        on:focus={handleSelectAll}
        class="editor"
      />
    {:else}
      <div>
        <strong class="error">テンプレートの変換が失敗しました。</strong>
        <pre>{outputData.error instanceof Error ? outputData.error.message : outputData.error}</pre>
      </div>
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

  .input-variables-area .variables-input-area,
  .input-variables-area .variables-import-export-area {
    margin: 0.5em 0 0;
  }

  .input-variables-area .variables-input-area:first-child,
  .input-variables-area .variables-import-export-area:first-child {
    margin-top: 0;
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
    border: 1px #ccc;
    border-style: solid none;
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
    border: none 1px #ccc;
    border-left-style: solid;
  }

  .output-area strong.error {
    color: red;
  }
</style>
