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

  const tabSelectedMap: { template: null | 'L' | 'R' } = {
    template: 'R',
  };

  const handleSelectTemplateTab = (areaType: 'L' | 'R') => () => {
    tabSelectedMap.template = areaType;
  };
  const handleUnelectTemplateTab = (areaType: 'L' | 'R') => () => {
    if (tabSelectedMap.template === areaType) {
      tabSelectedMap.template = null;
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
    <ul role="tablist">
      <li role="presentation">
        <button
          role="tab"
          aria-selected={tabSelectedMap.template === 'L'}
          on:click={handleSelectTemplateTab('L')}>テンプレート</button
        >
      </li>
      <li role="presentation">
        <button
          role="tab"
          aria-selected={tabSelectedMap.template !== 'L'}
          on:click={handleUnelectTemplateTab('L')}>変数</button
        >
      </li>
    </ul>
    {#if tabSelectedMap.template === 'L'}
      <CodeMirror
        mode="handlebars"
        bind:value={templateText}
        placeholder="テンプレートを入力"
        lineWrapping
        class="template-editor"
      />
      <p class="input-template-help">
        テンプレートの言語は
        <a href="https://handlebarsjs.com/" target="_blank">Handlebars</a>
        です。
      </p>
    {:else if tabSelectedMap.template === 'R' && 'error' in outputData}
      <div class="error">
        <strong>テンプレートの変換が失敗しました。</strong>
        <pre>{
            outputData.error instanceof Error
              ? `${outputData.error.name}\n${outputData.error.message}`
              : `type: ${typeof outputData.error}\n${outputData.error}`
          }</pre>
      </div>
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
    <ul role="tablist">
      <li role="presentation">
        <button
          role="tab"
          aria-selected={tabSelectedMap.template === 'R'}
          on:click={handleSelectTemplateTab('R')}>テンプレート</button
        >
      </li>
      <li role="presentation">
        <button
          role="tab"
          aria-selected={tabSelectedMap.template !== 'R'}
          on:click={handleUnelectTemplateTab('R')}>HTML</button
        >
      </li>
    </ul>
    {#if tabSelectedMap.template === 'R'}
      <CodeMirror
        mode="handlebars"
        bind:value={templateText}
        placeholder="テンプレートを入力"
        lineWrapping
        class="template-editor"
      />
      <p class="input-template-help">
        テンプレートの言語は
        <a href="https://handlebarsjs.com/" target="_blank">Handlebars</a>
        です。
      </p>
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
      <div class="error">
        <strong>テンプレートの変換が失敗しました。</strong>
        <pre>{
            outputData.error instanceof Error
              ? `${outputData.error.name}\n${outputData.error.message}`
              : `type: ${typeof outputData.error}\n${outputData.error}`
          }</pre>
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
    box-sizing: border-box;
    border-top: solid 1px #ccc;
    border-bottom: solid 1px #ccc;
  }

  ul[role='tablist'] {
    display: flex;
    list-style: none;
    margin: 0;
    border-bottom: solid 1px #ccc;
    padding: 0 0.5em;
  }

  ul[role='tablist'] li + li {
    margin-left: 0.5em;
  }

  ul[role='tablist'] button {
    height: 100%;
    border: solid 1px #ccc;
    background-color: white;
    color: black;
  }

  ul[role='tablist'] button[aria-selected='true'] {
    border-bottom-color: transparent;
  }

  .left-area,
  .right-area {
    flex: 1;
    width: 50%;

    display: flex;
    flex-direction: column;
  }

  .left-area > ul[role='tablist'],
  .right-area > ul[role='tablist'] {
    margin-top: 0.5em;
  }

  .variables-input-area,
  * :global(.template-editor),
  * :global(.output-html-editor),
  .error {
    flex: 1;
  }

  .variables-input-area {
    overflow-y: auto;
    padding: 0.5em;
  }

  .variables-import-export-area,
  .input-template-help,
  .html-export-area {
    margin: 0;
    border-top: solid 1px #ccc;
    text-align: right;
  }

  .variables-import-export-area,
  .html-export-area {
    text-align: right;
  }

  .variables-import-export-area {
    padding: 0.5em;
  }

  .variables-import-export-area input[type='button'] + input[type='button'] {
    margin-left: 0.5em;
  }

  .html-export-area {
    padding: 0.2em 0;
  }

  .input-template-help {
    padding: 0.5em 0;
    font-size: smaller;
  }

  .error {
    display: flex;
    flex-direction: column;
    justify-content: center; /* エラー表示の縦位置の中央揃え用 */
    max-width: 100%;
    box-sizing: border-box;
    margin: 0 auto; /* エラー表示の横位置の中央揃え用 */
    padding: 0 2em;
  }

  .error strong {
    color: red;
  }

  .error pre {
    overflow: auto;
  }
</style>
