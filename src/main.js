import App from './App.svelte';

/**
 * @see https://github.com/sveltejs/svelte/issues/537#issuecomment-298229185
 */
function replaceContainer ( Component, options ) {
  const { target: targetNode} = options;
  const doc = targetNode.ownerDocument ?? (targetNode instanceof Document ? targetNode : document);
  const frag = doc.createDocumentFragment();
  const component = new Component({ ...options, target: frag });

  targetNode.replaceWith( frag );

  return component;
}

replaceContainer(App, {
	target: document.getElementById('main'),
});
