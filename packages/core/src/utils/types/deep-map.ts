import type { IsAny } from './is-any'

/**
 * Maps all of an object's properties and sub-properties to a new type.
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
 * type DeepMapNumberMyType = DeepMap<MyType, number>
 *      // ^? type DeepMapNumberMyType = { a: number; b: { c: number; d: { e: number;  } } }
 */
export type DeepMap<T, TType> = IsAny<T> extends true
  ? any
  : T extends Record<PropertyKey, any>
  ? { [K in keyof T]: T[K] extends undefined ? never : DeepMap<T[K], TType> }
  : TType
