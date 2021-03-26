import type { SvelteComponent } from 'svelte';

import App from './App.svelte';

type SvelteComponentConstructor = typeof SvelteComponent;
type SvelteComponentOptions = ConstructorParameters<SvelteComponentConstructor>[0];

/**
 * @see https://github.com/sveltejs/svelte/issues/537#issuecomment-298229185
 */
function replaceContainer(Component: SvelteComponentConstructor, options: SvelteComponentOptions): SvelteComponent {
    const { target: targetNode } = options;
    const doc = targetNode.ownerDocument ?? (targetNode instanceof Document ? targetNode : document);
    const frag = doc.createDocumentFragment();
    const component = new Component(Object.assign(options, { target: frag }));

    targetNode.replaceWith(frag);

    return component;
}

const mainElem = document.getElementById('main');
if (mainElem) {
    replaceContainer(App, {
        target: mainElem,
    });
}
