import { isNullish } from '../guards/is-nullish'
import { isObject } from '../guards/is-object'

import { notNullArray } from './not-null-array'

export function deepGet<T = any>(obj: unknown, path?: PropertyKey, defaultValue?: unknown): T {
  if (!path || !isObject(obj)) {
    return defaultValue as T
  }

  if (typeof path !== 'string') {
    return obj[path as keyof typeof obj]
  }

  const result = notNullArray(path.split(/[,[\].]+?/)).reduce(
    (result, key) => (isNullish(result) ? result : result[key as keyof typeof obj]),
    obj,
  )

  if (result == null || result === obj) {
    return (
      isNullish(obj[path as keyof typeof obj]) ? defaultValue : obj[path as keyof typeof obj]
    ) as T
  }

  return result as T
}
