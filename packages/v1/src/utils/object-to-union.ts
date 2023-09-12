import type { AnyRecord } from './any-record'
import type { IsAny } from './is-any'

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
  [K in keyof T]: IsAny<T[K]> extends true
    ? any
    : T[K] extends AnyRecord
    ? ObjectToUnion<T[K], `${Key}${Extract<K, string>}.`>
    : { [key in `${Key}${Extract<K, string>}`]: T[K] }
}[keyof T]
