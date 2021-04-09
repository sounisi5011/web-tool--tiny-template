<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let classes = '';

  export let value: string;
  export let valueList: ReadonlyArray<string>;
  export { classes as class };

  const dispatch = createEventDispatcher<{
    change: { value: string };
  }>();
  const handleChange = (itemValue: string) => () => {
    if (itemValue !== value) {
      value = itemValue;
      dispatch('change', { value: itemValue });
    }
  };
</script>

<ul role="tablist" class={classes}>
  {#each valueList as itemValue}
    <li role="presentation">
      <button
        role="tab"
        aria-selected={itemValue === value}
        on:click={handleChange(itemValue)}
      >
        <slot value={itemValue}>{itemValue}</slot>
      </button>
    </li>
  {/each}
</ul>

<style>
  ul[role='tablist'] {
    display: flex;
    list-style: none;
    margin: 0;
    border-bottom: solid 1px #ccc;
    padding: 0;
  }

  ul[role='tablist'] li {
    margin-left: 0.5em;
    background-color: inherit;
  }

  ul[role='tablist'] li + li {
    margin-right: 0.5em;
  }

  ul[role='tablist'] button {
    cursor: pointer;
    height: 100%;
    border: solid 1px #ccc;
    background-color: #ccc;
  }

  ul[role='tablist'] button[aria-selected='true'] {
    border-bottom-color: transparent;
    background-color: inherit;
  }
</style>
