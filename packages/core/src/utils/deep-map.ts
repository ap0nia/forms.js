import type { IsAny } from './is-any'
import type { NonRecordNonPrimitives } from './not-record'

/**
 * Maps all of an object's properties and sub-properties to a new type.
 *
 * At the top level, explicit `any` is preserved as `any`.
 * Below the top level, properties explicitly typed as `any` are mapped to the new type.
 * A third generic param is used to represent whether the top level has been passed, lol.
 *
 * @example
 *
 * ```ts
 * type MyType = {
 *   a: string,
 *   b: {
 *     c: number,
 *     d: {
 *       e: boolean
 *     }
 *   }
 * }
 *
 * type A = DeepMap<MyType, number>
 * //   ^? type A = { a: number; b: { c: number; d: { e: number;  } } }
 * ```
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAkgzgQQHYgDwBUB8UC8UAMUEAHsBEgCZxQCMUAZFOlAPxTABOArtAFxQAzAIYAbOBABQEosTAB7DsHbhoAEQgQwAWSFgMAGiboVh+DCRIIHGWUrUARnLkiIQpLkGjx2PPGRosG3Iqdm5JKFZYOHNLaxJbEM4eaQjI9GNIFIj+NxAU-mZ44OoAJQgAYwUKVAAFDjlIRRAAaQgQQ1zMFLYAbygAbWaoAEt3AGs2uQEmAF1+dU0dPXRBmcN0k1CebABffKMVKVBIKC0QDOg8HpShfjhOUYBzfRT7fmvUqHL+JC4AW3sVhenwo7yyqQg-EczlcSHBewiewREmO0AQHgW2l0qDOF0MvwBVi6AHpiakAHosIA)
 *
 * Refer to `NotRecord` for documentation on edge cases.
 */
export type DeepMap<T, TType, IsInner extends boolean = false> = IsAny<T> extends true
  ? IsInner extends true
    ? TType
    : any
  : T extends NonRecordNonPrimitives
  ? TType
  : T extends Record<PropertyKey, any>
  ? { [K in keyof T]: DeepMap<T[K], TType, true> }
  : TType
