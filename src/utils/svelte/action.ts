/*
 * see https://svelte.dev/docs#use_action
 */

export function focus(
    node: HTMLElement,
    parameters: boolean | [boolean, () => void],
): void {
    const [isFocus, afterFn] = Array.isArray(parameters) ? parameters : [parameters];
    if (isFocus) {
        node.focus();
        if (afterFn) afterFn();
    }
}
