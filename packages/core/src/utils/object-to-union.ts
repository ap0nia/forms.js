import type { IsAny } from './is-any'
import type { Join } from './join'
import type { NonRecordNonPrimitives } from './not-record'

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
 * An intersection of these single property interfaces can build a new record.
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
 *
 * @param Depth allows you to limit the depth of the recursion in order to improve performance. Set to an arbitrary big number by default.
 */
export type ObjectToUnion<
  T,
  TPath extends any[] = [],
  TDepth extends number = 1000,
> = IsAny<T> extends true
  ? any
  : T extends NonRecordNonPrimitives
  ? T
  : TPath['length'] extends TDepth
  ? T
  :
      | {
          [K in keyof T]: IsAny<T[K]> extends true
            ? Record<Join<[...TPath, K]>, T[K]>
            : T[K] extends (infer U)[]
            ? IsAny<U> extends true
              ? Record<Join<[...TPath, K]>, T[K]>
              :
                  | Record<Join<[...TPath, K]>, T[K]>
                  | Record<Join<[...TPath, K, number]>, U>
                  | (U extends Record<PropertyKey, any>
                      ? U extends NonRecordNonPrimitives
                        ? never
                        : ObjectToUnion<U, [...TPath, K, number]>
                      : never)
            : T[K] extends NonRecordNonPrimitives
            ? Record<Join<[...TPath, K]>, T[K]>
            : T[K] extends Record<PropertyKey, any>
            ? ObjectToUnion<T[K], [...TPath, K]>
            : Record<Join<[...TPath, K]>, T[K]>
        }[keyof T]
      | (TPath extends [] ? never : Record<Join<TPath>, T>)
