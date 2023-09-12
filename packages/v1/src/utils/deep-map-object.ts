import type { AnyRecord } from './any-record'

/**
 * Recursively map all property keys to the corresponding type.
 */
export type DeepMapObject<T, TValue> = {
  [K in keyof T]: T[K] extends AnyRecord ? DeepMapObject<T[K], TValue> : TValue
}
