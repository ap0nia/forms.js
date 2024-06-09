import { get } from './get'
import type { Nullish } from './null'
import { set } from './set'

export function deepFilter(obj: unknown, key?: PropertyKey | PropertyKey[] | Nullish): any {
  if (key == null || obj == null) {
    return obj
  }

  const keyArray = Array.isArray(key) ? key : [key]

  if (keyArray.length === 0) {
    return obj
  }

  const result = keyArray.reduce((currentResult, currentKey) => {
    const value = get(obj, currentKey)

    set(currentResult, currentKey, value)

    return currentResult
  }, {})

  return result
}
