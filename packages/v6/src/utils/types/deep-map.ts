import type { IsAny } from './is-any'

/**
 * Maps all of an object's properties and sub-properties to a new type.
 *
 * At the top level, explicit `any` is preserved as `any`.
 * Below the top level, properties explicitly typed as `any` are mapped to the new type.
 *
 * A third generic param is used to represent this, lol.
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
export type DeepMap<T, TType, IsInner extends boolean = false> = IsAny<T> extends true
  ? IsInner extends true
    ? TType
    : any
  : T extends Record<PropertyKey, any>
  ? { [K in keyof T]: DeepMap<T[K], TType, true> }
  : TType
