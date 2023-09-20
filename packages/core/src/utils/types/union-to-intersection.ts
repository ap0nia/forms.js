/**
 * Convert the union of interfaces to an intersection of interfaces.
 *
 * @see https://stackoverflow.com/a/50375286
 *
 * @example
 *
 * ```ts
 * type A = { a: string }
 * type B = { b: string }
 * type C = { c: string }
 *
 * type ABC = A | B | C
 *
 * type MergedABC = UnionToIntersection<ABC>
 *      // ^? type MergedABC = A & B & C = { a: string, b: string, c: string; }
 * ```
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never
