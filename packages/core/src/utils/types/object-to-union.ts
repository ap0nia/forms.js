import type { IsAny } from './is-any'
import type { JoinArray } from './join-array'

/**
 * Recursively gets the union of all nested objects.
 *
 * Each property is recorded in dot notation.
 *
 * @example
 *
 * ```ts
 * type X = {
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
 * type Y = {
 *   a: { b: string }[]
 * }
 *
 * type A = ObjectToUnion<X>
 * //   ^? type A =
 *                | { a: string }
 *                | { b: { c: number } }
 *                | { d: { e: { f: boolean } } }
 *                | { 'a.b': { c: string } }
 *                | { 'd.e': { f: boolean } }
 *                | { 'd.e.f': boolean }
 *
 * type B = ObjectToUnion<Y>
 * //   ^? type B =
 *                | { a: { b: string }[] }
 *                | { [x: `a.${number}`]: { b: string } }
 *                | { [x: `a.${number}.b`]: string }
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
 * If you have a string union, then mapping an interface with it is done like
 *
 * `type MyType = ObjectToUnion<{ [K in MyStringUnion]: { ... } }>`
 *
 * However, if the union literally has one option, then it basically creates an interface with one property.
 * A union of these single property interfaces can build a new record.
 *
 * @example
 *
 * ```ts
 * type MyKeys = 'a'
 * type MyRecord = { [K in MyKeys]: any }
 *      // ^? type MyRecord = { a: any }
 * ```
 *
 * The top level record is also recorded if it's nested;
 * this type is mainly intended as a helper for flattening nested objects in a particular way.
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAkgzgQQHYgDwBUB8UC8UAMUEAHsBEgCZxQCMUAZFOlAPxTABOArtAFxQAzAIYAbOBABQE0JCgBlTgEskAcyEAjEdDxwlqqAB8oSLgFt1EDoajqA9ra1Ck19YpXLg1kyJHWulCAFlCAopGWgANVEeGAEAOVtgAFFTMFAMIlJyKihdDmUVABooKJEebDxmEjJKagByOtYoBqh+Up4w8GgAKVtlBA4OITQJKCZMmpz-AGskWwB3JABtAF1C0fkIMCEh4FsrauzqPILcZoA6OvWxgCUIOC4RT0Pa3L0VM4b1ivGXnNWNmw7g8nht+FUsq8lsoBJYoAAJCBCCjFc5omFw4HAFaAqC9fqDYaoDZjW73YDXUljORbHZCPYcSlUgAGABIAN7Ax7AAC+HPaEFiCWSqXSXKexRp212+0wfPZSVIQwAxsBUIjkZL3hotHLmSSoJgwVBxcApCQwPtPOEoAB5dQAKwgqvQtgAqkhFLYkBhigBpCAgah-agzOaLVZnVY-eDINBYCZHdjcSRjNhOEBgg1jIzs7NUqBLP1QZRQaaB2wCJgrfixlAYIsrbAh5MdAvtprswtyLjqAMgEvOfFIAZDNBLNHnftwf1NmtMRtQHn59vgxctgAUGKsboAlACOwWWCvD9Yu0se33A4O8X0R4Tx5Pp7PMPP0Ivl6eO7nu73+zfh1HIkJzRZ8oD9YoTHMSw534RVOCEVUgPjRtsE-L8CyMDc3UTV47mVfYKFQE5VGKDNsDYe0nRdd1PW9VA3WKECp0DGdwMgswLA4JtWmMCAADdLF3E8qTXP0VlwnJ8MI4j3jIlAjQwpoqOdYBXQ9L0fXfcSmKfViXxE0l+HPS9-1LQCH1QZiwPE18xIk9D2x5JZyxAStq3zLDpyWOotFUYAAAs6gkltCDYJABLhYzfyvAdzLvZDUGnOzxh5YTpC6KB4JVYBEoTSpJOoLckFhHd9wktgcPBTpZAADTOPMxiEfgSJUDZ1GMg1lX4KCuI2dCKE6qkICGgsBH4OwHCRJADXQ5dlwy2QAE0Go2ZqoC7Dq3nyfRnJxBabQQM4VJojT6Nqo0AHpLtJAA9Y9FugAAhY7HVU9S6J9JarpusZ7okIA)
 */
export type ObjectToUnion<T, Keys extends unknown[] = []> = IsAny<T> extends true
  ? any
  :
      | {
          [K in keyof T]: IsAny<T[K]> extends true
            ? { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
            : T[K] extends (infer U)[]
            ?
                | { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
                | { [SubKey in JoinArray<[...Keys, K, number]>]: ExtractArray<T[K]> }
                | (U extends Record<string, any> ? ObjectToUnion<U, [...Keys, K, number]> : never)
            : T[K] extends Record<string, any>
            ? ObjectToUnion<T[K], [...Keys, K]>
            : { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
        }[keyof T]
      | (Keys['length'] extends 0 ? never : { [SubKey in JoinArray<Keys>]: T })

type ExtractArray<T> = T extends (infer U)[] ? U : T
