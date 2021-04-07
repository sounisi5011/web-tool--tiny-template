<script lang="ts" context="module">
  export type Value =
    | string
    | number
    | boolean
    | Value[]
    | { [property: string]: Value };
  type RecordValue = Extract<Value, Record<string, unknown>>;
  type ReadonlyRecordValue = Readonly<RecordValue>;
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

  import { objectEntries, isObject } from '../utils';
  import type { TypeNode } from '../utils/handlebars/node';
  import { getTypeNodeByTypeName } from '../utils/handlebars/node';
  import LabelInputArea from './LabelInputArea.svelte';

  export let typeStructure: TypeNode;
  export let value: unknown;
  export let label = '';

  type StateRecordEntry = [string, { type: TypeNode; value: Value }];
  type StateValue =
    | { type: 'record'; entries: StateRecordEntry[]; value: RecordValue }
    | { type: 'array'; itemType: TypeNode; value: Value[] }
    | { type: 'boolean'; value: boolean }
    | { type: 'string'; value: string };
  function getValueState(currentValue: unknown, type: TypeNode): StateValue {
    if (type.type === 'union') {
      const targetType =
        type.children.record ||
        type.children.array ||
        type.children.string ||
        type.children.boolean;
      if (targetType) return getValueState(currentValue, targetType);
    } else if (type.type === 'record') {
      let entries: StateRecordEntry[] = [];
      const value: RecordValue = {};
      if (isObject(currentValue) && !Array.isArray(currentValue)) {
        entries = objectEntries(type.children).map<StateRecordEntry>(
          ([prop, valueType]) => {
            const childValue = getValueState(currentValue[prop], valueType)
              .value;
            value[prop] = childValue;
            return [
              prop,
              {
                type: valueType,
                value: childValue,
              },
            ];
          },
        );
      }
      return { type: 'record', entries, value };
    } else if (type.type === 'array') {
      const itemType = type.children;
      return {
        type: 'array',
        itemType,
        value: Array.isArray(currentValue)
          ? currentValue.map(
              (itemValue) => getValueState(itemValue, itemType).value,
            )
          : [],
      };
    } else if (type.type === 'boolean') {
      return { type: 'boolean', value: Boolean(currentValue) };
    }
    let value = '';
    if (type.type === 'string') {
      if (
        typeof currentValue === 'string' ||
        typeof currentValue === 'number' ||
        currentValue === true
      )
        value = String(currentValue);
    }
    return { type: 'string', value };
  }

  const dispatch = createEventDispatcher<EventMap>();

  let currentValueState: StateValue;
  $: currentValueState = getValueState(value, typeStructure);

  const handleInput = (newValue: Value) => {
    dispatch('input', { value: newValue });
    value = newValue;
  };

  const handleInputObjValue = (
    currentValue: ReadonlyRecordValue,
    prop: string,
  ) => (event: CustomEventMap['input']) =>
    handleInput({
      ...currentValue,
      [prop]: event.detail.value,
    });

  const handleInputArrayValue = (
    currentValue: readonly Value[],
    index: number,
  ) => (event: CustomEventMap['input']) =>
    handleInput(
      currentValue.map((v, i) => (index === i ? event.detail.value : v)),
    );

  const handleRemoveArrayItem = (
    currentValue: readonly Value[],
    index: number,
  ) => () => handleInput(currentValue.filter((_, i) => index !== i));

  const handleAddArrayItem = (
    currentValue: readonly Value[],
    itemType: TypeNode,
  ) => () => handleInput([...currentValue, getValueState('', itemType).value]);
</script>

{#if currentValueState.type === 'record'}
  {#each currentValueState.entries as [prop, { type: valueType, value: childValue }]}
    {#if getTypeNodeByTypeName(valueType, 'record') || getTypeNodeByTypeName(valueType, 'array')}
      <details open>
        <summary>{prop}</summary>
        <svelte:self
          typeStructure={valueType}
          value={childValue}
          on:input={handleInputObjValue(currentValueState.value, prop)}
        />
      </details>
    {:else}
      <svelte:self
        typeStructure={valueType}
        label={prop}
        value={childValue}
        on:input={handleInputObjValue(currentValueState.value, prop)}
      />
    {/if}
  {/each}
{:else if currentValueState.type === 'array'}
  <ul>
    {#each currentValueState.value as itemValue, index}
      <li>
        <svelte:self
          typeStructure={currentValueState.itemType}
          value={itemValue}
          on:input={handleInputArrayValue(currentValueState.value, index)}
        />
        <input
          type="button"
          value="削除"
          on:click={handleRemoveArrayItem(currentValueState.value, index)}
        />
      </li>
    {/each}
    <li>
      <input
        type="button"
        value="追加"
        on:click={handleAddArrayItem(
          currentValueState.value,
          currentValueState.itemType,
        )}
      />
    </li>
  </ul>
{:else}
  <p>
    <LabelInputArea>
      <span slot="labelText" class="labelText">{label}</span>
      {#if currentValueState.type === 'boolean'}
        <input
          type="checkbox"
          checked={currentValueState.value}
          on:change={(event) => handleInput(event.currentTarget.checked)}
        />
      {:else}
        <textarea
          value={currentValueState.value}
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
