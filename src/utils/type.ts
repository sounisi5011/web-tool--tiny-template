export type FirstParamType<T> = T extends (...args: infer P) => unknown ? P[0] : never;
