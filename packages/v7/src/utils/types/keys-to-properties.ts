/**
 * Given an object and a tuple of keys belonging to the object, return a new tuple mapping the keys to their values.
 *
 * This type ***does not*** enforce that the provided tuple only has valid keys of the object.
 *
 * Any invalid keys will be mapped to `never`.
 *
 * @example
 *
 * ```ts
 * type Foo = {
 *  a: string
 *  b: number
 *  c: boolean
 * }
 *
 * type Keys = ['a', 'b', 'c', 'd']
 *
 * type Result = KeysToProperties<Foo, Keys>
 *      // ^? type Result = [string, number, boolean, never]
 * ```
 */
export type KeysToProperties<
  T extends Record<PropertyKey, any>,
  Keys extends unknown[],
  Answer extends unknown[] = [],
> = Keys extends []
  ? Answer
  : Keys extends [infer Head, ...infer Tail]
  ? KeysToProperties<T, Tail, [...Answer, T[Extract<Head, keyof T>]]>
  : T
