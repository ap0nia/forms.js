import type { IsAny } from './is-any'

/**
 * Maps all of an object's properties and sub-properties to a new type.
 *
 * At the top level, explicit `any` is preserved as `any`.
 * Below the top level, properties explicitly typed as `any` are mapped to the new type.
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
 * [Typescript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAkgzgQQHYgDwBUB8UC8UAMUEAHsBEgCZxQCMUAZFOlAPxTABOArtAFxQAzAIYAbOBABQEosTAB7DsHbhoAEQgQwAWSFgMAGiboV2PPGRosMspWqcerKEJRR+6zTrAwkSCBwNGJlIk8orKkFDu2rrevv7ohujGkKawiCgY2CQ2VOzcklCOSSrSrkzW5LkAShAAxgoUqAAKHHKQiiAA0hAghs4gmKVsAN5QANqdUACWSFAA1j1yAkwAum4a0V4+fhgTK4nJENgAvqX8xZBSoBFaIIe4UMOlQvxwnDMA5vqlAEb8T4VCrV+EguABbH5+b6AqAUf6lGEQfg-ORyEQQZwIqCnQqnHESa7QBAPKKeVC3Q6GUEQvyDAD0dMBAD0WEA)
 */
export type DeepMap<T, TType> = IsAny<T> extends true ? any : DeepMapInner<T, TType>

export type DeepMapInner<T, TType> = IsAny<T> extends true
  ? TType
  : T extends Record<PropertyKey, any>
  ? { [K in keyof T]: DeepMapInner<T[K], TType> }
  : TType
