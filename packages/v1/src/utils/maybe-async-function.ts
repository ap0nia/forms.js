import type { MaybePromise } from './maybe-promise'
export type MaybeAsyncFunction<T> = (...args: unknown[]) => MaybePromise<T>
