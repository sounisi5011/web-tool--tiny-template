export function triggerEnter<T extends KeyboardEvent>(fn: (event: T) => void): (event: T) => void {
    return event => {
        // Note: IMEの入力確定のEnter入力を除外するため、isComposingプロパティがfalseであることを確認する
        if (event.key === 'Enter' && !event.isComposing) fn(event);
    };
}

/**
 * @see https://stackoverflow.com/a/25715985/4907315
 */
export function downloadFile({ filename, contents, mime }: { filename: string, contents: BlobPart | BlobPart[], mime: string }) {
    const blob = new Blob(Array.isArray(contents) ? contents : [contents], {type: mime});
    const url = URL.createObjectURL(blob);
    const aElem = document.createElement('a');

    aElem.download = filename;
    aElem.href = url;

    aElem.addEventListener('click', () => requestAnimationFrame(() => {
        document.body.removeChild(aElem);
        URL.revokeObjectURL(url);
    }));

    // Firefox requires the link to be in the body
    document.body.appendChild(aElem);
    aElem.click();
}
