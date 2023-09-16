import type { IsAny } from './is-any'

/**
 * Makes all of an object's properties and sub-properties optional.
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
 * type DeepPartialMyType = DeepPartial<MyType>
 *      // ^? type DeepPartialMyType = { a?: string; b?: { c?: number; d?: { e?: boolean;  } } }
 */
export type DeepPartial<T> = IsAny<T> extends true
  ? any
  : T extends Record<PropertyKey, any>
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T
