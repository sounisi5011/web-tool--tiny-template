<script lang="ts">
  let classes = '';

  export let error: unknown;
  export { classes as class };
</script>

<div class={classes} class:error={true}>
  <strong>テンプレートの変換が失敗しました。</strong>
  <pre>{
      error instanceof Error
        ? `${error.name}\n${error.message}`
        : `type: ${typeof error}\n${error}`
    }</pre>
</div>

<style>
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
