import type { IsAny } from './is-any'

/**
 * Deeply merges properties of left and right objects.
 *
 * This is different from a typical merge type because the first condition recurs for nested objects.
 *
 * Ignores top-level any for both left and right.
 *
 * @remarks Makes everything partial.
 *
 * @example
 *
 * ```ts
 * type Left = { a: { b: string } }
 * type Right = { a: { c: number, d: boolean } }
 *
 * type A = DeepMerge<Left, Right>
 * //   ^? type A = { a: { b: string, c: number, d: boolean } }
 *
 * type B = DeepMerge<Left, any>
 * //   ^? type B = { a: { b: string } }
 *
 * type C = DeepMerge<any, Right>
 * //   ^? type C = { a: { c: number, d: boolean } }
 * ```
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAkgzgQQHYgDwBUB8UC8UAMUEAHsBEgCZxQCMUAZFOlAPxTABOArtAFxQAzAIYAbOBABQEkmAD2HYO3DQAIhAhgAshA4BzCKgAyEAcAA0UAEoBLXQAtg2PPGRpjp7CTKVqnHhKhWK1sHAKh+FxRUG3tHIlJyKnZuSUC2d2Aw-gyoAB9g2PjvJKEUAG0AXTC2NQ1tPQh0LjARAwyLGIdMLKgAbzDAwLKAaShrJCgAawgQWQEoHPzp2fnO4Ar+Ua9E6mW5hZNFRj3VkMzBi6CyjJGKjrPbiqKdqDLZACMAKwgAY3MoD7fP5VS6XGrqLQ6fRGQ63e6xW7dUEXbKw4ZPfJrW4DS6bZ4+KYzfYZHEXdJokHIvHbAknAqhZFBLHo0mDfhICAANx0OIAvlJQJAoLVIQ0mi02od4V1cLBEFEMp4EgS-KkmWcepE0GslcVfClqgdTD0cjSSuVKWw1vjzSBKji2GUAHQu9pQF1OtaUwLsrk8n1QDncjgC5RGxR4XpQIT8KPvfhwTjjXRQXmp0NC62R6OxqA-dlcAC27x0Fgo-HeslkrVKqfTUAkgugCFlIvq0LdOokAHpu4MAHosDPQABCrYh7clpgspRA3V7A6HjbDAGFx3UoQZZ9LHD2+4FBxIgA)
 */
export type DeepMerge<Left, Right> = IsAny<Left> extends true
  ? Right
  : IsAny<Right> extends true
  ? Left
  : Left | Right extends any[]
  ? DeepMergeTuple<Left, Right>
  : DeepMergeObject<Left, Right>

type DeepMergeObject<Left, Right> = {
  [K in OptionalKeys<Left, Right>]?: DeepMergeObjectValue<Left, Right, K>
} & {
  [K in RequiredKeys<Left, Right>]: DeepMergeObjectValue<Left, Right, K>
}

type DeepMergeObjectValue<Left, Right, K> = K extends keyof Left & keyof Right
  ? [Left[K], Right[K]] extends [object, object]
    ? DeepMerge<Left[K], Right[K]>
    : Left[K] | Right[K]
  : K extends keyof Left
  ? Left[K]
  : K extends keyof Right
  ? Right[K]
  : never

/**
 * @see https://github.com/type-challenges/type-challenges/issues/2664#issuecomment-1514489577
 */
type RequiredKeys<Left, Right> = keyof {
  [K in keyof Left | keyof Right as {} extends Pick<Left & Right, K> ? never : K]: (Left & Right)[K]
}

/**
 * @see https://github.com/type-challenges/type-challenges/issues/210#issue-700899240
 */
type OptionalKeys<Left, Right> = keyof {
  [P in keyof Left | keyof Right]-?: {} extends Pick<Left & Right, P> ? P : never
}

/**
 * Basically just joins the two tuples.
 *
 * TODO: handle this more with more finesse?
 */
export type DeepMergeTuple<Left, Right> = IsAny<Left> extends true
  ? Right
  : IsAny<Right> extends true
  ? Left
  : Left extends any[]
  ? Right extends any[]
    ? [...Left, ...Right]
    : never
  : never
