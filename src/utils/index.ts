export function isSingleTuple<T>(array: readonly [T?, ...unknown[]]): array is [T] {
    return array.length === 1;
}

export function objectValues<T extends Record<string, unknown>>(o: T): Array<Required<T>[keyof T]> {
    return (Object.keys(o) as Array<keyof T>).map(prop => o[prop]);
}

export function objectEntries<T extends Record<string, unknown>>(o: T): Array<[keyof T, T[keyof T]]> {
    return (Object.keys(o) as Array<keyof T>).map(prop => [prop, o[prop]]);
}

export function mergeSet<T>(
    set1: ReadonlySet<T> | Iterable<T> | null | undefined,
    ...setNArray: Array<ReadonlySet<T> | Iterable<T> | null | undefined>
): Set<T> {
    const newSet = new Set<T>(set1);
    for (const setN of setNArray) {
        if (setN) {
            for (const value of setN) {
                newSet.add(value);
            }
        }
    }
    return newSet;
}
