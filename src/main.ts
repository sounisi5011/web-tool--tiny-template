import App from './App.svelte';
import type { SvelteComponent } from 'svelte';

/**
 * @see https://github.com/sveltejs/svelte/issues/537#issuecomment-298229185
 */
function replaceContainer ( Component: typeof SvelteComponent, options: ConstructorParameters<typeof SvelteComponent>[0] ): SvelteComponent {
  const { target: targetNode} = options;
  const doc = targetNode.ownerDocument ?? (targetNode instanceof Document ? targetNode : document);
  const frag = doc.createDocumentFragment();
  const component = new Component(Object.assign( options, { target: frag }));

  targetNode.replaceWith( frag );

  return component;
}

const mainElem = document.getElementById('main');
if (mainElem) {
  replaceContainer(App, {
    target: mainElem,
  });
}
