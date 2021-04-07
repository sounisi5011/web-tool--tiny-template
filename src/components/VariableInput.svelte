<script lang="ts" context="module">
  export type Value =
    | string
    | number
    | boolean
    | Value[]
    | { [property: string]: Value };
  type EventMap = {
    input: {
      value: Value;
    };
  };
  export type CustomEventMap = {
    [P in keyof EventMap]: CustomEvent<EventMap[P]>;
  };
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { objectEntries, isObject, isNotNullish } from '../utils';
  import type { TypeNode } from '../utils/handlebars/node';
  import { getTypeNodeByTypeName } from '../utils/handlebars/node';
  import LabelInputArea from './LabelInputArea.svelte';

  export let typeStructure: TypeNode;
  export let value: unknown;
  export let label = '';

  function normalizeValue(currentValue: unknown, type: TypeNode): Value {
    if (type.type === 'union') {
      const targetType =
        type.children.record ||
        type.children.array ||
        type.children.string ||
        type.children.boolean;
      return targetType ? normalizeValue(currentValue, targetType) : '';
    } else if (type.type === 'record') {
      const record: Extract<Value, Record<string, unknown>> = {};
      if (isObject(currentValue) && !Array.isArray(currentValue)) {
        for (const [prop, valueType] of objectEntries(type.children)) {
          const value = normalizeValue(currentValue[prop], valueType);
          if (value !== null) record[prop] = value;
        }
      }
      return record;
    } else if (type.type === 'array') {
      if (!Array.isArray(currentValue)) return [];
      return currentValue
        .map((itemValue) => normalizeValue(itemValue, type.children))
        .filter(isNotNullish);
    } else if (type.type === 'boolean') {
      return Boolean(currentValue);
    } else if (type.type === 'string') {
      if (typeof currentValue === 'string') return currentValue;
      if (typeof currentValue === 'number' || currentValue === true)
        return String(currentValue);
    }
    return '';
  }

  function getObjValue(
    currentValue: unknown,
    prop: string,
  ): unknown | undefined {
    if (isObject(currentValue) && !Array.isArray(currentValue)) {
      return currentValue[prop];
    }
    return undefined;
  }

  function getStrValue(currentValue: unknown): string {
    if (typeof currentValue === 'string') return currentValue;
    if (typeof currentValue === 'number' || currentValue === true)
      return String(currentValue);
    return '';
  }

  const dispatch = createEventDispatcher<EventMap>();

  let internalValue: Value;
  $: internalValue = normalizeValue(value, typeStructure);

  const handleInput = (newValue: Value) => {
    dispatch('input', { value: newValue });
    internalValue = newValue;
    value = newValue;
  };

  const handleInputValue = (event: CustomEventMap['input']) =>
    handleInput(event.detail.value);

  const handleInputObjValue = (prop: string) => (
    event: CustomEventMap['input'],
  ) => {
    if (typeof internalValue === 'object' && !Array.isArray(internalValue)) {
      handleInput({
        ...internalValue,
        [prop]: event.detail.value,
      });
    }
  };

  const handleInputArrayValue = (index: number) => (
    event: CustomEventMap['input'],
  ) => {
    const newValue = [...(Array.isArray(internalValue) ? internalValue : [])];
    newValue[index] = event.detail.value;
    handleInput(newValue);
  };

  const handleAddArrayItem = (itemType: TypeNode) => () => {
    if (Array.isArray(internalValue)) {
      handleInput([...internalValue, normalizeValue('', itemType)]);
    }
  };
</script>

{#if typeStructure.type === 'union'}
  {#if typeStructure.children.record}
    <svelte:self
      typeStructure={typeStructure.children.record}
      value={value}
      on:input={handleInputValue}
    />
  {:else if typeStructure.children.array}
    <svelte:self
      typeStructure={typeStructure.children.array}
      value={value}
      on:input={handleInputValue}
    />
  {:else if typeStructure.children.string}
    <svelte:self
      typeStructure={typeStructure.children.string}
      value={value}
      on:input={handleInputValue}
      label={label}
    />
  {:else if typeStructure.children.boolean}
    <svelte:self
      typeStructure={typeStructure.children.boolean}
      value={value}
      on:input={handleInputValue}
      label={label}
    />
  {/if}
{:else if typeStructure.type === 'record'}
  {#each objectEntries(typeStructure.children) as [prop, valueType]}
    {#if getTypeNodeByTypeName(valueType, 'record') || getTypeNodeByTypeName(valueType, 'array')}
      <details open>
        <summary>{prop}</summary>
        <svelte:self
          typeStructure={valueType}
          value={getObjValue(value, prop)}
          on:input={handleInputObjValue(prop)}
        />
      </details>
    {:else}
      <svelte:self
        typeStructure={valueType}
        label={prop}
        value={getObjValue(value, prop)}
        on:input={handleInputObjValue(prop)}
      />
    {/if}
  {/each}
{:else if typeStructure.type === 'array'}
  <ul>
    {#if Array.isArray(value)}
      {#each value as itemValue, index}
        <li>
          <svelte:self
            typeStructure={typeStructure.children}
            value={itemValue}
            on:input={handleInputArrayValue(index)}
          />
        </li>
      {/each}
    {/if}
    <li>
      <input
        type="button"
        value="追加"
        on:click={handleAddArrayItem(typeStructure.children)}
      />
    </li>
  </ul>
{:else}
  <p>
    <LabelInputArea>
      <span slot="labelText" class="labelText">{label}</span>
      {#if typeStructure.type === 'boolean'}
        <input
          type="checkbox"
          checked={Boolean(value)}
          on:change={(event) => handleInput(event.currentTarget.checked)}
        />
      {:else}
        <textarea
          value={getStrValue(value)}
          on:input={(event) => handleInput(event.currentTarget.value)}
        />
      {/if}
    </LabelInputArea>
  </p>
{/if}

<style>
  details {
    margin-left: 1em;
  }
  details > summary {
    margin-left: -1em;
    cursor: pointer;
  }
</style>
