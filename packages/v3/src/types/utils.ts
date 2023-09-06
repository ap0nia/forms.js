/**
 * A noop is any sort of function that's intended to do nothing.
 */
export type Noop = (...args: unknown[]) => unknown

/**
 * A nullish type. Because void isn't considered the same as null | undefined ??
 */
export type Nullish = null | undefined | void
