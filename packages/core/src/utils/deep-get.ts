import { isNullish } from '../guards/is-nullish'
import { isObject } from '../guards/is-object'
import { notNullArray } from './not-null-array'

export function deepGet<T>(obj: T, path?: PropertyKey, defaultValue?: unknown): any {
  if (!path || !isObject(obj)) {
    return defaultValue
  }

  if (typeof path !== 'string') {
    return obj[path as keyof T]
  }

  const result = notNullArray(path.split(/[,[\].]+?/)).reduce(
    (result, key) => (isNullish(result) ? result : result[key as keyof {}]),
    obj,
  )

  return isNullish(result) || result === obj
    ? isNullish(obj[path as keyof T])
      ? defaultValue
      : obj[path as keyof T]
    : result
}
