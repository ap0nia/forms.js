import type { IsAny } from './is-any'
import type { NonRecordNonPrimitives } from './not-record'

/**
 * Makes all of an object's properties and sub-properties __required__.
 *
 * Does not handle explicit `any`.
 *
 * @example
 *
 * ```ts
 * type MyType = {
 *   a?: string,
 *   b?: {
 *     c?: number,
 *     d?: {
 *       e?: boolean
 *     }
 *   }
 * }
 *
 * type A = DeepRequired<MyType>
 * // ^? type A = { a: string; b: { c: number; d: { e: boolean; } } }
 * ```
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAkgzgQQHYgDwBUB8UC8UAMUEAHsBEgCZxQCMUAZFOlAPxTABOArtAFxQAzAIYAbOBABQEkmAD2HYO3DQAIhAhgAShACOXAJYcIFDNjzxkaLEVLkq7bpKisoQlBOf9mJMpWraAY3kTAAUOWUgFEABpCBAAGlcUTA8XAG8oAG1oqH0kKABrONkBJgBdAFoWfjUNbT1DYwxssuwAX1SvKVBIKABZEHRlXCg01KFqqDhOPIBzeNSAI0mx52cAyaQuAFtFiA4FtagKFdSjiEnF2VkRCDczqA7nDqeJHugEEdqtXQMjEwGQ0gKQA9CC1gA9FhAA)
 */
export type DeepRequired<T> = IsAny<T> extends true
  ? any
  : T extends NonRecordNonPrimitives
  ? T
  : T extends Record<PropertyKey, any>
  ? { [K in keyof T]-?: DeepRequired<T[K]> }
  : T
