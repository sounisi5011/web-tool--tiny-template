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
<div class="footer">
  <slot name="footer" />
  <p class={helpClass} class:input-template-help={true}>
    テンプレートの言語は
    <a href="https://handlebarsjs.com/" target="_blank">Handlebars</a>
    です。
  </p>
</div>

<style>
  .footer {
    display: flex;
    border-top: solid 1px #ccc;
  }
  .input-template-help {
    flex: auto;
    margin: auto 0;
    padding: 0.5em 0;
    text-align: right;
    font-size: smaller;
  }
</style>
