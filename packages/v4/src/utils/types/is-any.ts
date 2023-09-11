/**
 * Detects whether the given type is explicitly `any`.
 *
 * @see https://stackoverflow.com/a/49928360
 */
export type IsAny<T> = 0 extends 1 & T ? true : false
