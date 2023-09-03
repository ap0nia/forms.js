import type { IsAny } from '../types/utils'

export type TrimTrailingDot<T extends string> = T extends `${infer U}.` ? U : T

/**
 * Convert the union of interfaces to an intersection of interfaces.
 *
 * @see https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type/50375286#50375286
 *
 * @internal
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

/**
 * Recursively gets the union of all nested objects.
 *
 * Each property is recorded in dot notation.
 *
 * @example
 *
 * ```ts
 * type MyType = {
 *   a: {
 *     b: string,
 *     c: {
 *        d: number
 *     }
 *   },
 *   e: boolean
 * }
 *
 * type MyTypeUnion = ObjectToUnion<MyType>
 *
 * type MyTypeUnion =
 *   | { 'a.b': string, }
 *   | { 'a.b.c.d': number }
 *   | { 'e': boolean }
 *
 * ```
 *
 * @see https://stackoverflow.com/a/68518494
 *
 * @remarks
 * This is a recursive type, so it may cause a stack overflow if the object is too deeply nested,
 * i.e. if any value is explicitly or implicitly `any`. This is why it terminates early if `IsAny<T>` is `true`.
 *
 * @internal
 */
export type ObjectToUnion<T, Key extends string = ''> = {
  [K in keyof T]: IsAny<T | T[K]> extends true
    ? any
    : T[K] extends Record<string, any>
    ? ObjectToUnion<T[K], `${Key}${K & string}.`> | Record<TrimTrailingDot<Key>, T>
    : Record<`${Key}${K & string}`, T[K]> | Record<TrimTrailingDot<Key>, T>
}[keyof T]

export type MyType = {
  a: {
    b: string
    c: {
      d: number
    }
  }
  e: boolean
}

export type MyTypeUnion = ObjectToUnion<MyType>

/**
 * Flatten an object into a single-depth object.
 *
 * Nested properties are concatenated with a dot.
 *
 * @example
 *
 * ```ts
 * type MyType = {
 *   a: {
 *     b: string,
 *     c: {
 *        d: number
 *     }
 *   },
 *   e: boolean
 * }
 *
 * type MyFlattenedType = FlattenObject<MyType>
 *
 * type MyFlattenedType = {
 *   'a.b': string,
 *   'a.b.c.d': number,
 *   'e': boolean
 * }
 * ```
 */
export type FlattenObject<T> = UnionToIntersection<ObjectToUnion<T>>

/**
 * A union of all the keys of a flattened object.
 */
export type FlattenObjectKey<T> = keyof FlattenObject<T>
