/* eslint-disable @typescript-eslint/ban-types */

import type { IsAny } from './is-any'

/**
 * @see https://twitter.com/mattpocockuk/status/1622730173446557697?s=20
 *
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
 * // This is one object with all the properties in A, B, and C. But it's hard to read.
 * type ABC = A & B & C
 *
 * // Much better!
 * type Prettified = Prettify<ABC>
 *      // ^? type Prettified = { a: string; b: number; c: boolean }
 *
 * ```
 */
export type Prettify<T extends Record<PropertyKey, any>> = IsAny<T> extends true
  ? any
  : { [K in keyof T]: T[K] } & {}
