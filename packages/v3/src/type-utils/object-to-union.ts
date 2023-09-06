import type { IsAny } from './is-any'
import type { Join } from './join'

/**
 * Recursively gets the union of all nested objects.
 *
 * Each property is recorded in dot notation.
 *
 * @example
 *
 * ```ts
 * type MyType = {
 *   a: string
 *   b: {
 *     c: number
 *   }
 *   d: {
 *     e: {
 *       f: boolean
 *     }
 *   }
 * }
 *
 * type MyTypeUnion = ObjectToUnion<MyType>
 *
 * type MyTypeUnion = { a: string } | { 'b.c': number } | { 'd.e.f': boolean }
 * ```
 *
 * @see https://stackoverflow.com/a/68518494
 *
 * @remarks
 *
 * This is a recursive type, so it may cause a stack overflow if the object is too deeply nested,
 * i.e. if either the provided T or a property value T[K] is explicitly `any`.
 * This is why it terminates early if `IsAny<T>` or `IsAny<T[K]>` is `true`.
 *
 * @internal
 */
export type ObjectToUnion<T, Keys extends unknown[] = []> = IsAny<T> extends true
  ? any
  : {
      [K in keyof T]: IsAny<T[K]> extends true
        ? any
        : T[K] extends Record<string, any>
        ? ObjectToUnion<T[K], [...Keys, K]>
        : { [key in Join<[...Keys, K]>]: T[K] }
    }[keyof T]
