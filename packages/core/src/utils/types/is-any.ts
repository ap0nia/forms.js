/**
 * Detects whether the given type is explicitly `any`.
 *
 * @see https://stackoverflow.com/a/49928360
 *
 * 0 can only extend 1 if it is intersected with `any`.
 *
 * @example
 *
 * ```ts
 * type A = 0 extends (1 & number) ? true : false
 *      ^? false
 *
 * type B = 0 extends (1 & string) ? true : false
 *      ^? false
 *
 * type C = 0 extends (1 & {}) ? true : false
 *      ^? false
 *
 * type D = 0 extends (1 & any) ? true : false
 *      ^? true
 * ```
 */
export type IsAny<T> = 0 extends 1 & T ? true : false
