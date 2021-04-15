import type { JsonValue } from '../utils/type';

const keyPrefix = 'web-tool--tiny-template/';

function getFullKey(key: string): string {
    return keyPrefix + key;
}

export function readData<T>(key: string, validateFn: (value: unknown) => value is T): { data: T } | undefined {
    const fullKey = getFullKey(key);
    try {
        const dataString = localStorage.getItem(fullKey);
        if (typeof dataString !== 'string') return undefined;
        const data: JsonValue = JSON.parse(dataString);
        return validateFn(data) ? { data } : undefined;
    } catch {
        return undefined;
    }
}

export function saveData<T = JsonValue>(key: string, value: T): boolean {
    const fullKey = getFullKey(key);
    try {
        const dataString = JSON.stringify(value);
        localStorage.setItem(fullKey, dataString);
        return localStorage.getItem(fullKey) === dataString;
    } catch {
        return false;
    }
}
