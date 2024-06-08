import type { FlattenObject } from './flatten-object'
import type { IsAny } from './is-any'

/**
 * Remove properties that are mapped to `never`.
 */
export type RemoveNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K]
}
/**
 * Extract only properties that are mapped to an array of objects.
 *
 * Any invalid properties are marked as `never`.
 */
export type RawNestedObjectArrays<T> = {
  [K in keyof T]: IsAny<T[K]> extends true
    ? any
    : T[K] extends (infer U)[]
    ? U extends Record<string, any>
      ? T[K]
      : never
    : never
}

/**
 * Flatten an object and filter by properties that are mapped to an array of objects.
 */
export type NestedObjectArrays<T> = RemoveNever<RawNestedObjectArrays<FlattenObject<T>>>
