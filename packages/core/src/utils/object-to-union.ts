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
 * @internal
 */
export type ObjectToUnion<T, Key extends string = ''> = {
  [K in keyof T]: T[K] extends Record<PropertyKey, unknown>
    ? ObjectToUnion<T[K], `${Key}${Extract<K, string>}.`>
    : { [key in `${Key}${Extract<K, string>}`]: T[K] }
}[keyof T]
