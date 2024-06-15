import type { IsAny } from './is-any'
import type { NonRecordNonPrimitives } from './not-record'

/**
 * Makes all of an object's properties and sub-properties __optional__.
 *
 * Does not handle explicit `any`.
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
 * type A = DeepPartial<MyType>
 * //   ^? type A = { a?: string; b?: { c?: number; d?: { e?: boolean;  } } }
 *
 * type B = DeepPartial<any>
 * //   ^? type B = any
 * ```
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?ssl=23&ssc=8&pln=9&pc=1#code/C4TwDgpgBAkgzgQQHYgDwBUB8UC8UAMUEAHsBEgCZxQCMUAZFOlAPxTABOArtAFxQAzAIYAbOBABQEkmAD2HYO3DQAIhAhgACkIUBLURmx54yNFiKlyVdt0lRWUISgn3+zEmUrUAShADG8hSomhyykAogANIQIAA0jiiYLg4A3lAA2pFQukhQANYxsgJMALos-Goa2noG6Jkl2AC+yW5SoJBQALIg6Mq4UCnJQvxwnDkA5rHJAEb8g-b2fvxIXAC20xAcUwtQFHPJOxD807KyIhBOB1DN9s03Eu3QCP2VWjrA+iKo3b2QSQD0-wWAD0WG0+gAhF7qN41L5OEAAoH2UFAA)
 */
export type DeepPartial<T> = IsAny<T> extends true
  ? any
  : T extends NonRecordNonPrimitives
  ? T
  : T extends Record<PropertyKey, any>
  ? {
      [K in keyof T]?: ExtractObjects<T[K]> extends never ? T[K] : DeepPartial<T[K]>
    }
  : T

export type ExtractObjects<T> = T extends infer U ? (U extends object ? U : never) : never
