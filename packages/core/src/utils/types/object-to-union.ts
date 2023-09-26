import type { IsAny } from './is-any'
import type { JoinArray } from './join-array'

/**
 * Recursively gets the union of all nested objects.
 *
 * Each property is recorded in dot notation.
 *
 * @example
 *
 * ```ts
 * type MyType = {
 *   a: string
 *   b: {
 *     c: number
 *   }
 *   d: {
 *     e: {
 *       f: boolean
 *     }
 *   }
 * }
 *
 * type MyTypeUnion = ObjectToUnion<MyType>
 *
 * type MyTypeUnion =
 *  | { a: string }
 *  | { b: { c: number } }
 *  | { 'b.c': number }
 *  | { d: { e: { f: boolean } } }
 *  | { 'd.e': { f: boolean } }
 *  | { 'd.e.f': boolean }
 * ```
 *
 * @see https://stackoverflow.com/a/68518494
 *
 * @remarks
 *
 * This is a recursive type, so it may cause a stack overflow if the object is too deeply nested,
 * i.e. if either the provided T or a property value T[K] is explicitly `any`.
 * This is why it terminates early if `IsAny<T>` or `IsAny<T[K]>` is `true`.
 *
 * If you have a string union, then mapping an interface with it is done like
 *
 * `type MyType = ObjectToUnion<{ [K in MyStringUnion]: { ... } }>`
 *
 * However, if the union literally has one option, then it basically creates an interface with one property.
 * A union of these single property interfaces can build a new record.
 *
 * @example
 *
 * ```ts
 * type MyKeys = 'a'
 * type MyRecord = { [K in MyKeys]: any }
 *      // ^? type MyRecord = { a: any }
 * ```
 *
 * The top level record is also recorded if it's nested;
 * this type is mainly intended as a helper for flattening nested objects in a particular way.
 */
export type ObjectToUnion<T, Keys extends unknown[] = []> = IsAny<T> extends true
  ? any
  :
      | {
          [K in keyof T]: IsAny<T[K]> extends true
            ? { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
            : T[K] extends any[]
            ?
                | { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
                | { [SubKey in JoinArray<[...Keys, K, number]>]: ExtractArray<T[K]> }
            : T[K] extends Record<string, any>
            ? ObjectToUnion<T[K], [...Keys, K]>
            : { [SubKey in JoinArray<[...Keys, K]>]: T[K] }
        }[keyof T]
      | (Keys['length'] extends 0 ? never : { [SubKey in JoinArray<Keys>]: T })

type ExtractArray<T> = T extends (infer U)[] ? U : T
