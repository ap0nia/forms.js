/**
 * Detects whether the given type is explicitly `any`.
 *
 * @see https://stackoverflow.com/a/49928360
 *
 * Logic: 0 can only extend 1 if T is explcitly `any`.
 */
export type IsAny<T> = 0 extends 1 & T ? true : false
