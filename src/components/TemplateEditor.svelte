<script lang="ts">
  import 'codemirror/mode/handlebars/handlebars';

  import CodeMirror from './CodeMirror.svelte';

  export let value: string;
  export let editorClass = '';
  export let helpClass = '';
</script>

<CodeMirror
  mode="handlebars"
  bind:value
  placeholder="テンプレートを入力"
  lineWrapping
  class={editorClass}
/>
<p class={helpClass} class:input-template-help={true}>
  テンプレートの言語は
  <a href="https://handlebarsjs.com/" target="_blank">Handlebars</a>
  です。
</p>

<style>
  .input-template-help {
    margin: 0;
    border-top: solid 1px #ccc;
    padding: 0.5em 0;
    text-align: right;
    font-size: smaller;
  }
</style>
