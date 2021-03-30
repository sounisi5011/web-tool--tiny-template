<script lang="ts" context="module">
  import CodeMirror from '@joshnuss/svelte-codemirror';
  import type {
    Editor as CodeMirrorEditor,
    EditorConfiguration as CodeMirrorConfig,
  } from 'codemirror';
  import { createEventDispatcher, onMount } from 'svelte';

  type EventMap = {
    focus: { instance: CodeMirrorEditor; event: FocusEvent };
  };
  type CustomEventMap = { [P in keyof EventMap]: CustomEvent<EventMap[P]> };

  export type {
    CodeMirrorEditor,
    CodeMirrorConfig,
    CustomEventMap as EventMap,
  };
</script>

<script lang="ts">
  let classes = '';
  export let mode: string | ({ mode: string } & Record<string, unknown>);
  export let value: string | null | undefined = '';
  export let readonly: boolean | 'nocursor' = false;
  export let lineNumbers = true;
  export let lineWrapping = false;
  export let editor: CodeMirrorEditor | null = null;
  export let options: CodeMirrorConfig = {};
  export { classes as class };

  const dispatch = createEventDispatcher<EventMap>();

  onMount(() => {
    /*
     * これをしておかないと、なぜか、ページ読み込み直後のCodeMirrorの表示内容が空になり、何か操作をするまで改善されない。
     */
    const init = () =>
      requestAnimationFrame(() => {
        if (editor) {
          editor.setValue(value ?? '');
          return;
        }
        init();
      });
    init();
  });

  $: if (editor) {
    editor.on('focus', (instance, event) =>
      dispatch('focus', { instance, event }),
    );
  }
  $: if (editor) {
    editor.setValue(value ?? '');
  }
</script>

<CodeMirror
  bind:editor
  class={classes}
  options={{ mode, lineNumbers, lineWrapping, readOnly: readonly, ...options }}
/>
