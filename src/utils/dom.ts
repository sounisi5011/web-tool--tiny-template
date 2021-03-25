export function triggerEnter<T extends KeyboardEvent>(fn: (event: T) => void): (event: T) => void {
    return event => {
        // Note: IMEの入力確定のEnter入力を除外するため、isComposingプロパティがfalseであることを確認する
        if (event.key === 'Enter' && !event.isComposing) fn(event);
    };
}
