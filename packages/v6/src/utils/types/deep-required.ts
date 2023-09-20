import type { IsAny } from './is-any'

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
 * type DeepRequiredMyType = DeepRequired<MyType>
 *      // ^? type DeepRequiredMyType = { a: string; b: { c: number; d: { e: boolean;  } } }
 */
export type DeepRequired<T> = IsAny<T> extends true
  ? any
  : T extends Record<PropertyKey, any>
  ? { [K in keyof T]-?: DeepRequired<T[K]> }
  : T
