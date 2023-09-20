import { deepSet } from './deep-set'
import type { Nullish } from './null'
import { safeGet } from './safe-get'

export function deepFilter<T = any>(obj: unknown, key?: PropertyKey | PropertyKey[] | Nullish): T {
  if (key == null || obj == null) {
    return obj as T
  }

  const keyArray = Array.isArray(key) ? key : [key]

  if (keyArray.length === 0) {
    return obj as T
  }

  const result = keyArray.reduce((currentResult, currentKey) => {
    const value = safeGet(obj, currentKey)

    deepSet(currentResult, currentKey, value)

    return currentResult
  }, {} as T)

  return result
}
