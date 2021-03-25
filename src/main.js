import App from './App.svelte';

/**
 * @param {Node} targetNode
 */
function removeChildren(targetNode) {
  let childNode;
  while (childNode = targetNode.firstChild) {
    targetNode.removeChild(childNode);
  }
}

const mainElem = document.getElementById('main');

removeChildren(mainElem);
new App({
	target: mainElem,
});
