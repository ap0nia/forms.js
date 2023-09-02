import { isDateObject } from './isDateObject'
import { isNullish } from './isNullish'

export function isObject<T extends object>(value: unknown): value is T {
  return (
    !isNullish(value) && !Array.isArray(value) && typeof value === 'object' && !isDateObject(value)
  )
}
