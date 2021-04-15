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
  import { readData, saveData } from './data/localStorage';
  import Handlebars from './handlebars';
  import { isObject } from './utils';
  import { downloadFile, pickFile } from './utils/dom';
  import { getVariableTypeStructure } from './utils/handlebars';
  import type { TypeNode } from './utils/handlebars/node';
  import type { JsonValue } from './utils/type';

  interface SavedData {
    template: string;
    variables: JsonValue;
  }

  function validateSavedData(value: unknown): value is SavedData {
    /* eslint-disable dot-notation */
    return (
      isObject(value) &&
      typeof value['template'] === 'string' &&
      'variables' in value
    );
    /* eslint-enable */
  }

  const SAVE_KEY = 'all-data';

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

  function readJson(reader: FileReader, callback: (data: JsonValue) => void) {
    reader.addEventListener('load', () => {
      const { result } = reader;
      if (typeof result !== 'string') {
        alert(
          `ファイルの読み込みが失敗しました。FileReaderオブジェクトが、文字列ではない結果を返しました`,
        );
        return;
      }

      let data: JsonValue;
      try {
        data = JSON.parse(result);
      } catch (error) {
        alert(
          `ファイルの読み込みが失敗しました。指定されたファイルは適切なJSONではありません:\n  ${error}`,
        );
        return;
      }

      callback(data);
    });
    reader.addEventListener('error', () => {
      alert(`ファイルの読み込みが失敗しました:\n  ${reader.error}`);
    });
    reader.addEventListener('abort', () => {
      alert(`ファイルの読み込みが中断されました`);
    });
  }

  const savedData = readData(SAVE_KEY, validateSavedData);
  let [variablesContext, templateText] = savedData
    ? [savedData.data.variables, savedData.data.template]
    : [defaultVariablesRecord, defaultTemplateText];
  let dataSavedStatus:
    | null
    | 'ロードしました'
    | '一時保存しました'
    | '一時保存が失敗しました' = savedData ? 'ロードしました' : null;

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

  $: {
    const saveSuccess = saveData<SavedData>(SAVE_KEY, {
      template: templateText,
      variables: variablesContext,
    });
    dataSavedStatus = saveSuccess
      ? '一時保存しました'
      : '一時保存が失敗しました';
  }

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
      readJson(reader, (data) => {
        if (
          confirm(
            `現在の変数の入力を消去し、ファイルで指定された変数で上書きします。よろしいですか？`,
          )
        ) {
          variablesContext = data;
        }
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

  const handleImportAll = () => {
    pickFile({ accept: '.json' }, (file) => {
      const reader = new FileReader();
      readJson(reader, (data) => {
        if (!validateSavedData(data)) {
          alert(
            `ファイルの読み込みが失敗しました。インポートするJSONには、文字列値が指定された「template」プロパティと、変数のデータが指定された「variables」プロパティが必要です。`,
          );
          return;
        }

        if (
          confirm(
            `現在の入力内容を消去し、ファイルで指定されたテンプレートと変数で上書きします。よろしいですか？`,
          )
        ) {
          templateText = data.template;
          variablesContext = data.variables;
        }
      });
      reader.readAsText(file);
    });
  };
  const handleExportAll = () => {
    const allData: SavedData = {
      template: templateText,
      variables: variablesContext,
    };
    downloadFile({
      filename: 'all-data.json',
      contents: JSON.stringify(allData, null, 2),
      mime: 'application/json',
    });
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
      <p class="import-export-area variables-import-export-area">
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
      <p class="import-export-area html-export-area">
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
  <div class="footer-area">
    <p
      class="saved-status"
      class:error={dataSavedStatus === '一時保存が失敗しました'}
    >
      {dataSavedStatus}
    </p>
    <p class="import-export-area all-data-import-export-area">
      <input
        type="button"
        value="全てのデータをJSONからインポート"
        on:click={handleImportAll}
      />
      <input
        type="button"
        value="すべてのデータをJSONにエクスポート"
        on:click={handleExportAll}
      />
    </p>
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
    display: grid;
    /*
    Note: なぜ`minmax(0, 1fr)`でうまくいくのか分からない。わからないが、コレで上手くいくのでとりあえず使っている。
          参考：CSS Gridの中でSlickを利用すると画像がとんでもなく大きくはみ出る | SSSSSN https://sssssn.com/archives/657
    */
    grid-template-rows: minmax(0, 1fr) auto;
    grid-template-columns: 50% 50%;
    box-sizing: border-box;
    border-top: solid 1px #ccc;
    border-bottom: solid 1px #ccc;
  }

  .left-area,
  .right-area {
    box-sizing: border-box;
    overflow: hidden;
    overflow: clip;

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

  .import-export-area {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-content: space-evenly;
    gap: 0.5em;
    margin: 0;
    padding: 0.5em;
  }

  .variables-import-export-area,
  .html-export-area {
    border-top: solid 1px #ccc;
  }

  .footer-area {
    grid-column: 1 / -1;

    display: flex;
    border-top: solid 1px #ccc;
  }

  .footer-area > .import-export-area {
    flex: auto;
  }

  .saved-status {
    margin: auto 0;
    margin-left: 1em;
    color: green;
    font-size: small;
  }
  .saved-status::before {
    content: '\2705\FE0F'; /* WHITE HEAVY CHECK MARK(U+2705)にVARIATION SELECTOR-16(U+FE0F)を追加し、常に絵文字として表示させる */
    padding-right: 0.5em;
  }
  .saved-status.error {
    color: crimson;
  }
  .saved-status.error::before {
    content: '\274C\FE0F'; /* CROSS MARK(U+274C)にVARIATION SELECTOR-16(U+FE0F)を追加し、常に絵文字として表示させる */
  }
</style>
