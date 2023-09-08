export type Nullish = null | undefined | void

export function isNullish(value: unknown): value is Nullish {
  return value == null
}
