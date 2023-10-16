/**
 * Given an object and a tuple of keys belonging to the object, returns a tuple mapping the keys to their values.
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
 * type A = KeysToProperties<Foo, Keys>
 *      // ^? type A = [string, number, boolean, never]
 * ```
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?#code/AQUwHgDg9gTgLsOBPCJgGkRIM4BUoAKMUq8AliNgDwBQwwuoYcIAdgCbbABKIAxrHZUiJEPCSYkAGmABDVkgB8UuhixdwLDlwCurANasoAd1YBtALor6AQVbZjYpls7A9hk+YvAAvMEsqir5qOM5srpaqAPzAdg5iqgBcIRrM4VxmZKwAZk4AEiCy7DIAdGVZuTAMsmQANhbRKfgipHAU1LgyuDW1MmZlJXGOMF1mAKLMMLJ8cFQFRTL6WFDZDIoWFopJDDQ0yKjAAGJQUMEA3qqyydhwMFkA5qoARsmsOgC2Twn0fMlPJ7VCqwaABfOh7FBoSRcPxmADksjhMjhTyRwDhfDRcPYcIawAhB142B0tQQfmhzWIrXaVGOUBk0K2AHomfRgAA9KI0IA)
 */
export type KeysToProperties<
  T,
  Keys extends unknown[],
  Answer extends unknown[] = [],
> = Keys extends []
  ? Answer
  : Keys extends [infer Head, ...infer Tail]
  ? KeysToProperties<T, Tail, [...Answer, T[Extract<Head, keyof T>]]>
  : T
