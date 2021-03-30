<script lang="ts" context="module">
  import 'codemirror/lib/codemirror.css';

  import { fromTextArea } from 'codemirror';
  import type {
    Editor as CodeMirrorEditor,
    EditorFromTextArea as CodeMirrorEditorFromTextArea,
    EditorConfiguration as CodeMirrorConfig,
  } from 'codemirror';
  import 'codemirror/addon/display/placeholder';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  type EventMap = {
    focus: { instance: CodeMirrorEditor; event: FocusEvent };
  };
  type CustomEventMap = { [P in keyof EventMap]: CustomEvent<EventMap[P]> };

  export type {
    CodeMirrorEditorFromTextArea as CodeMirrorEditor,
    CodeMirrorConfig,
    CustomEventMap as EventMap,
  };
</script>

<script lang="ts">
  let classes = '';
  export let mode: string | ({ name: string } & Record<string, unknown>);
  export let value: string | null | undefined = '';
  export let readonly: boolean | 'nocursor' = false;
  export let placeholder = '';
  export let lineNumbers = true;
  export let lineWrapping = false;
  export let editor: CodeMirrorEditorFromTextArea | null = null;
  export let options: CodeMirrorConfig = {};
  export { classes as class };

  let element: HTMLTextAreaElement;
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
  onDestroy(() => {
    if (editor) {
      editor.toTextArea();
    }
  });

  const updateValue = (newValue: string) => {
    value = newValue;
  };

  $: if (element) {
    createEditor({
      mode,
      lineNumbers,
      lineWrapping,
      readOnly: readonly,
      ...options,
    });
  }
  $: if (editor) {
    editor.on('focus', (instance, event) =>
      dispatch('focus', { instance, event }),
    );
    editor.on('change', (instance) => updateValue(instance.getValue()));
  }
  $: if (editor) {
    const currentValue = editor.getValue();
    if (currentValue !== value) {
      editor.setValue(value ?? '');
    }
  }
  $: if (editor) {
    const classesList = classes.split(/\s+/).filter((token) => token !== '');
    editor.getWrapperElement().classList.add(...classesList);
  }

  function createEditor(options: CodeMirrorConfig) {
    editor = fromTextArea(element, options);
  }
</script>

<textarea bind:this={element} placeholder={placeholder} />
