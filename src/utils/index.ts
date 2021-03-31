export function objectEntries<T extends Record<string, unknown>>(o: T): Array<[keyof T, T[keyof T]]> {
    return (Object.keys(o) as Array<keyof T>).map(prop => [prop, o[prop]]);
}
