/**
 * Checks whether the type is literally `any`.
 *
 * @see https://stackoverflow.com/a/49928360/3406963
 *
 * @typeParam T - type which may be any
 *
 * @example
 *
 * ```ts
 * IsAny<any> = true
 * IsAny<string> = false
 * ```
 */
export type IsAny<T> = 0 extends 1 & T ? true : false

/**
 * A noop is any sort of function that's intended to do nothing.
 */
export type Noop = (...args: unknown[]) => unknown

/**
 * A nullish type. Because void isn't considered the same as null | undefined ??
 */
export type Nullish = null | undefined | void

export type DeepPartial<T> = T extends Record<PropertyKey, unknown>
  ? T
  : { [K in keyof T]?: DeepPartial<T[K]> }
