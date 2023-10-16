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
 * type Result = UnionToIntersection<ABC>
 * //   ^? type Result = A & B & C = { a: string, b: string, c: string; }
 * ```
 *
 * [TypeScript Playground](https://www.typescriptlang.org/play?#code/KYDwDg9gTgLgBDAnmYcCqA7AlhDAVCASQxmCgGdgBjGHDAHjQD44BeOACjTlFIwBNycAIYZEcAPycA1gC50ASjYsAbhCz848jMBVklvYAKEcAUHDhy4WDADMycQgBpTS1qvX9zkx9+26yU1MkFDgAQTY4AG8ReXIYKBsAczgAX2DkVAAhSJiAIziE5LSM0IBhXLgqQsSMFPTS1DCsivYIgB84HM6yoJDUACVgcgBXABt4dkw6AmJSCmpaXHpmsqZTAHoNizgAPQkgA)
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never
