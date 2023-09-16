/**
 * A tiny utility type that just allows a value to be a promise or not.
 */
export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>
