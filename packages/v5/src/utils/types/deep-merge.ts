import type { IsAny } from './is-any'

/**
 * Deeply merges properties of left and right objects.
 *
 * This is different from a typical merge type because the first condition recurs for nested objects.
 *
 * Ignores top-level any for both left and right.
 *
 * @example
 *
 * ```ts
 * type Left = { a: { b: string } }
 * type Right = { a: { c: number, d: boolean } }
 *
 * type Result = DeepMerge<Left, Right>
 *      // ^? type Result = { a: { b: string, c: number, d: boolean } }
 * ```
 */
export type DeepMerge<Left, Right> = IsAny<Left> extends true
  ? Right
  : IsAny<Right> extends true
  ? Left
  : Left | Right extends any[]
  ? DeepMergeTuple<Left, Right>
  : {
      [K in keyof Left | keyof Right]: K extends keyof Left & keyof Right
        ? [Left[K], Right[K]] extends [object, object]
          ? DeepMerge<Left[K], Right[K]>
          : Left[K] | Right[K]
        : K extends keyof Left
        ? Left[K]
        : K extends keyof Right
        ? Right[K]
        : never
    }

/**
 * Basically just joins the two tuples.
 *
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
