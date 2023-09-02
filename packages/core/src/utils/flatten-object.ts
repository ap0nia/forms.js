import type { ObjectToUnion } from './object-to-union'
import type { UnionToIntersection } from './union-to-intersection'

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
 * type MyTypeUnion = ObjectToUnion<MyType>
 *
 * type MyTypeUnion =
 *   | { 'a.b': string, }
 *   | { 'a.b.c.d': number }
 *   | { 'e': boolean }
 * ```
 */
export type FlattenObject<T> = UnionToIntersection<ObjectToUnion<T>>
