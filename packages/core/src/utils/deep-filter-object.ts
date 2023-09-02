import type { AnyRecord } from './any-record'
import type { IsResultOrNever } from './is-result-or-never'

/**
 * Recursively extract all property keys with values of the corresponding type.
 */
export type DeepFilterObject<T extends AnyRecord, TValue> = {
  [K in keyof T as IsResultOrNever<T[K], AnyRecord | TValue, K>]: T[K] extends AnyRecord
    ? DeepFilterObject<T[K], TValue>
    : IsResultOrNever<T[K], TValue>
}
