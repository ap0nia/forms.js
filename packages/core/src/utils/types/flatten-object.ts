import type { ObjectToUnion } from './object-to-union'
import type { Prettify } from './prettify'
import type { UnionToIntersection } from './union-to-intersection'

/**
 * Flatten an object into a single-depth object.
 *
 * Nested properties are concatenated with a dot.
 *
 * @remarks
 * It also recursively includes all nested properties at the top level,
 * including those that are also objects.
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
 *   "a.b": string;
 *   "a.c.d": number;
 *   "a.c": {
 *     d: number;
 *   };
 *   a: {
 *     b: string;
 *     c: {
 *       d: number;
 *     };
 *   };
 *   e: boolean;
 * }
 * ```
 */
export type FlattenObject<T> = Prettify<UnionToIntersection<ObjectToUnion<T>>>
