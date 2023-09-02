import { isDateObject } from './is-date-object'
import { isNullish } from './is-nullish'

export function isObject<T extends object>(value: unknown): value is T {
  return (
    !isNullish(value) && !Array.isArray(value) && typeof value === 'object' && !isDateObject(value)
  )
}
