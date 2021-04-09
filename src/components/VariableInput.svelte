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
  import { createEventDispatcher, afterUpdate } from 'svelte';
  import { autoresize } from 'svelte-textarea-autoresize';

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
        type.children.record &&
        Object.keys(type.children.record.children).length > 0
          ? type.children.record
          : type.children.array ||
            type.children.string ||
            type.children.boolean;
      if (targetType) return getValueState(currentValue, targetType);
    } else if (type.type === 'record') {
      const inputValue =
        isObject(currentValue) && !Array.isArray(currentValue)
          ? currentValue
          : undefined;
      const value: RecordValue = {};
      const entries = objectEntries(type.children).map<StateRecordEntry>(
        ([prop, valueType]) => {
          const childValue = getValueState(inputValue?.[prop], valueType).value;
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

  /**
   * `true`の場合は、`handleInputString()`の処理を1度だけスキップする。
   */
  let skipOnceHandleInputString = false;
  const handleInputString = (event: { currentTarget: HTMLTextAreaElement }) => {
    if (!skipOnceHandleInputString) {
      handleInput(event.currentTarget.value);
    }
    skipOnceHandleInputString = false;
  };

  /**
   * svelte-textarea-autoresizeはvalueプロパティの直接更新でサイズが変更されないため、
   * コンポーネントが更新されるたびにinputイベントを発生させ、サイズ変更を実行させる。
   */
  afterUpdate(() => {
    if (textInputElement) {
      const _textInputElement = textInputElement;
      /**
       * requestAnimationFrameを使用しないとサイズが変更されない。
       * おそらく、DOM更新中には適切なサイズを読み取れない。
       */
      requestAnimationFrame(() => {
        skipOnceHandleInputString = true;
        _textInputElement.dispatchEvent(new Event('input'));
      });
    }
  });
  let textInputElement: HTMLTextAreaElement | undefined;
</script>

{#if currentValueState.type === 'record'}
  {#each currentValueState.entries as [prop, { type: valueType, value: childValue }]}
    {#if getTypeNodeByTypeName(valueType, 'record') || getTypeNodeByTypeName(valueType, 'array')}
      <details class="record-entry" open>
        <summary>{prop}</summary>
        <div class="child-items">
          <svelte:self
            typeStructure={valueType}
            value={childValue}
            on:input={handleInputObjValue(currentValueState.value, prop)}
          />
        </div>
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
  <ul class="array-type">
    {#each currentValueState.value as itemValue, index}
      <li class="child-items">
        <svelte:self
          typeStructure={currentValueState.itemType}
          value={itemValue}
          on:input={handleInputArrayValue(currentValueState.value, index)}
        />
        <p class="remove-array-item">
          <input
            type="button"
            value="削除"
            on:click={handleRemoveArrayItem(currentValueState.value, index)}
          />
        </p>
      </li>
    {/each}
    <li class="add-array-item">
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
  <p
    class="primitive-type"
    class:string-type={currentValueState.type === 'string'}
    class:has-label={Boolean(label)}
  >
    <LabelInputArea isShowLabel={Boolean(label)}>
      <span slot="labelText">{label}</span>
      {#if currentValueState.type === 'boolean'}
        <input
          type="checkbox"
          checked={currentValueState.value}
          on:change={(event) => handleInput(event.currentTarget.checked)}
        />
      {:else}
        <textarea
          bind:this={textInputElement}
          value={currentValueState.value}
          on:input={handleInputString}
          use:autoresize
        />
      {/if}
    </LabelInputArea>
  </p>
{/if}

<style>
  details {
    padding-left: 1em;
  }
  details > summary {
    margin-left: -1em;
    cursor: pointer;
  }
  details > summary:hover {
    background-color: #ccc;
  }

  .record-entry > summary {
    margin-bottom: 0.5em;
  }
  .record-entry > .child-items {
    margin: 0.5em 0;
    border: solid 1px #ccc;
    padding: 0.5em;
  }

  .array-type {
    list-style: none;
    padding: 0;
  }
  .array-type > li + li {
    margin-top: 0.5em;
    border-top: solid 1px #ccc;
    padding-top: 0.5em;
  }

  .add-array-item input[type='button'] {
    display: block;
    margin: 0 auto;
    min-width: min-content;
    width: 50%;
  }

  .remove-array-item input[type='button'] {
    display: block;
    margin-left: auto;
  }

  .child-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(10em, 100%), 1fr));
    gap: 0.5em;
  }
  .child-items > :global(*) {
    margin: 0;
  }
  .child-items > :global(:not(.primitive-type.has-label)) {
    grid-column: 1 / -1;
  }

  .primitive-type {
    margin: 0;
  }
  .primitive-type :global(label) {
    display: block;
    cursor: pointer;
  }
  .primitive-type :global(label):hover {
    background-color: lightgreen;
  }

  .string-type :global(label) {
    display: flex;
    flex-flow: column;
    cursor: text;
  }
  .string-type textarea {
    box-sizing: border-box;
    resize: none;
    width: 100%;
    max-height: 4em;
  }
</style>
