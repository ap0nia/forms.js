import type { IsAny } from './is-any'

/**
 * Explicit `any` will not be handled.
 *
 * The main purpose is to merge an intersection of objects into a single object.
 *
 * @example
 *
 * ```ts
 * type A = { a: string }
 * type B = { b: number }
 * type C = { c: boolean }
 *
 * type ABC = A & B & C
 * //   ^? A & B & C
 *
 * type Prettified = Prettify<ABC>
 * //   ^? { a: string; b: number; c: boolean; }
 *
 * type Ignored = Prettify<any>
 * //   ^? any
 * ```
 *
 * [Matt Pocock's Tweet](https://twitter.com/mattpocockuk/status/1622730173446557697)
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAkgzgQQHYgDwBUB8UC8UAMUEAHsBEgCZxQCMUAZFOlAPxTABOArtAFxQAzAIYAbOBABQEkmAD2HYO3DQAChwjBgASwFosuWIhQZsJMpWqcerKEJRR+AbygBtANJQtSKAGsIIWQEmAF1+dHdgqABfBihHKKklSCgEA2chfjhOLwBzaIkk6AAhNKgAI34kLgBbMogOfMKoAGFSgGN+MtlZEQg7RoLQZIQi1rxUxhLGZoKAelmoRYA9FkSh1XVNHS0ICgM1DW1dVBHmzDmF5dWgA)
 *
 */
export type Prettify<T> = IsAny<T> extends true ? any : { [K in keyof T]: T[K] } & {}
