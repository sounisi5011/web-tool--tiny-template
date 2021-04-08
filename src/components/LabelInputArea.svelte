<script lang="ts">
  export let isShowLabel = true;

  /**
   * Note: eslint-plugin-svelte3@3.1.2は、`{#if ...}`文内の`$$slots`変数を認識せず、`no-undef`エラーを発生させる。
   *       このため、変数に代入して回避する。
   * @see https://github.com/sveltejs/eslint-plugin-svelte3/issues/107
   */
  const slots = $$slots;
</script>

{#if slots.labelText && isShowLabel}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label>
    <slot name="labelText" />
    <slot />
  </label>
{:else}
  <slot />
{/if}
