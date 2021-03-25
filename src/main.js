import App from './App.svelte';

/**
 * @see https://github.com/sveltejs/svelte/issues/537#issuecomment-298229185
 */
function replaceContainer ( Component, options ) {
  const frag = document.createDocumentFragment();
  const component = new Component({ ...options, target: frag });

  options.target.replaceWith( frag );

  return component;
}

replaceContainer(App, {
	target: document.getElementById('main'),
});
