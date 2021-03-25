export type VariableRecord = Record<string, string | number | boolean | null>;

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return typeof value === 'object' && value !== null;
}

export function validateVariableRecord(value: unknown): value is VariableRecord {
    if (!isObject(value)) return false;
    for (const prop of Object.keys(value)) {
        const val = value[prop];
        if (val !== null && typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') return false;
    }
    return true;
}
