export function triggerEnter<T extends KeyboardEvent>(fn: (event: T) => void): (event: T) => void {
    return event => {
        if (event.key === 'Enter') fn(event);
    };
}
