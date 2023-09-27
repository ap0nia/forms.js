/**
 * A nullish type. Because void isn't considered the same as null | undefined ??
 */
export type Nullish = null | undefined | void

/**
 * Not very useful.
 */
export function isNullish(value: unknown): value is Nullish {
  return value == null
}

/**
 * This is a necessary type guard mimic for array filtering.
 */
export function notNullish<T>(value: T): value is NonNullable<T> {
  return !isNullish(value)
}
