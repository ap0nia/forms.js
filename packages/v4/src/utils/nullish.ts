/**
 * A nullish type. Because void isn't considered the same as null | undefined ??
 */
export type Nullish = null | undefined | void

export function isNullish(value: unknown): value is Nullish {
  return value == null
}
