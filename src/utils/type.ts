export type FirstParamType<T> = T extends (...args: infer P) => unknown ? P[0] : never;

/**
 * @see https://github.com/sindresorhus/type-fest/blob/v1.0.2/source/basic.d.ts#L37
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
/**
 * @see https://github.com/sindresorhus/type-fest/blob/v1.0.2/source/basic.d.ts#L27
 */
export type JsonObject = { [k in string]: JsonValue };
/**
 * @see https://github.com/sindresorhus/type-fest/blob/v1.0.2/source/basic.d.ts#L32
 */
export type JsonArray = JsonValue[];
