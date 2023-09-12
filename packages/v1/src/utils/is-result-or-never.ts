/**
 * Given a test point, T, and a desired type, TValue,
 * return TResult if T is assignable to TValue, otherwise never.
 */
export type IsResultOrNever<T, TValue, TResult = T> = T extends TValue ? TResult : never
