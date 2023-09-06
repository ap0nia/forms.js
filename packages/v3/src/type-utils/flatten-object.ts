import type { ObjectToUnion } from './object-to-union'
import type { Prettify } from './prettify'

/**
 * Convert the union of interfaces to an intersection of interfaces.
 *
 * @see https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type/50375286#50375286
 *
 * @internal
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

/**
 * Flatten an object into a single-depth object.
 *
 * Nested properties are concatenated with a dot.
 *
 * @example
 *
 * ```ts
 * type MyType = {
 *   a: {
 *     b: string,
 *     c: {
 *        d: number
 *     }
 *   },
 *   e: boolean
 * }
 *
 * type MyFlattenedType = FlattenObject<MyType>
 *
 * type MyFlattenedType = {
 *   'a.b': string,
 *   'a.b.c.d': number,
 *   'e': boolean
 * }
 * ```
 */
export type FlattenObject<T> = Prettify<UnionToIntersection<ObjectToUnion<T>>>
