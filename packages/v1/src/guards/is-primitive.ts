import { isNullish } from './is-nullish'

export type Primitive = null | undefined | string | number | boolean | symbol | bigint

export function isPrimitive(value: unknown): value is Primitive {
  return !isNullish(value) && typeof value !== 'object'
}
