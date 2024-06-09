import { isKey } from './is-key'
import { isObject } from './is-object'
import { stringToPath } from './string-to-path'

/**
 * Given a dot-concatenated string path, deeply set a property, filling in any missing objects along the way.
 */
export function set<T>(object: unknown, path: PropertyKey, value?: unknown): T {
  if (object == null) {
    return value as any
  }

  if (typeof path === 'number' || typeof path === 'symbol') {
    object[path as never] = value as never
    return object[path as never] as T
  }

  const keyArray = isKey(path) ? [path] : stringToPath(path)

  const lastIndex = keyArray.length - 1

  const lastKey = keyArray[lastIndex]

  const result = keyArray.reduce((currentResult, currentKey, index) => {
    if (index === lastIndex) {
      currentResult[currentKey as never] = value as never
      return currentResult
    }

    const currentValueIsNotObject = !isObject(currentResult[currentKey as never])

    if (currentValueIsNotObject || currentResult[currentKey as never] == null) {
      currentResult[currentKey as never] = (isNaN(keyArray[index + 1] as any) ? {} : []) as never
    }

    return currentResult[currentKey as never]
  }, object)

  return result[lastKey as never] as T
}
