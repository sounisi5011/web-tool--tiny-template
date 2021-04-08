/**
 * @see https://stackoverflow.com/a/25715985/4907315
 */
export function downloadFile({ filename, contents, mime }: {
    filename: string;
    contents: BlobPart | BlobPart[];
    mime: string;
}): void {
    const blob = new Blob(Array.isArray(contents) ? contents : [contents], { type: mime });
    const url = URL.createObjectURL(blob);
    const aElem = document.createElement('a');

    aElem.download = filename;
    aElem.href = url;

    aElem.addEventListener('click', () =>
        requestAnimationFrame(() => {
            document.body.removeChild(aElem);
            URL.revokeObjectURL(url);
        }));

    // Firefox requires the link to be in the body
    document.body.appendChild(aElem);
    aElem.click();
}

export function pickFile(
    { accept = '' }: { accept?: string },
    callback: (file: File) => void,
): void {
    const inputElem = document.createElement('input');

    inputElem.type = 'file';
    inputElem.accept = accept;
    inputElem.addEventListener('change', () => {
        const file = (inputElem.files ?? [])[0];
        if (file) callback(file);
    });

    inputElem.click();
}
