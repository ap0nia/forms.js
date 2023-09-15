export type Primitive = null | undefined | string | number | boolean | symbol | bigint

export function isPrimitive(value: unknown): value is Primitive {
  return value != null && typeof value !== 'object'
}
