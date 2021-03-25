<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { autoresize } from 'svelte-textarea-autoresize';
  import {triggerEnter} from '../utils/dom'
  import { focus } from '../utils/svelte/action'

  let valueInputElem: HTMLTextAreaElement;

  function focusValueInput(event: KeyboardEvent) {
    event.preventDefault();
    valueInputElem.focus();
  }

  export let name: string;
  export let value: string | undefined;
  export let defined: boolean;
  export let duplicate = false;
  export let autofocusValue: boolean = false;

  const dispatch = createEventDispatcher();
</script>

<fieldset>
  <legend>
    <input type=text class=variable-name bind:value={name} on:keydown={triggerEnter(focusValueInput)}>
    {#if !defined || duplicate}
      <strong class=error>
        {#if duplicate}
          同じ名前の変数が定義されています
        {:else if !defined}
          テンプレート内に変数が存在しません
        {/if}
      </strong>
      <input type=button value=削除 on:click={() => dispatch('remove')}>
    {/if}
    {#if value === undefined}
      <em class=info>変数を検知したため、自動で追加されました</em>
    {/if}
  </legend>
  <textarea use:autoresize bind:value={value} bind:this={valueInputElem} use:focus={[autofocusValue, () => autofocusValue = false]}></textarea>
</fieldset>

<style>
  :global(input[type=text].variable-name) {
    color: deepskyblue;
    font-size: 75%;
  }

  strong.error {
    color: red;
    font-size: smaller;
  }

  em.info {
    font-style: normal;
    color: lime;
    font-size: smaller;
  }

  fieldset {
    margin: 0;
  }

  fieldset>textarea {
    width: 100%;
    height: 2.5em;
    min-height: 2.5em;
    resize: vertical;
  }
</style>
