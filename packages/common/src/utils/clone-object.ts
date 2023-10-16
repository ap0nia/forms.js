import { isBrowser } from './is-browser'
import { isObject, isPlainObject } from './is-object'

/**
 * Similar to {@link structuredClone}, but compatible with stuff like React nodes.
 */
export function cloneObject<T>(data: T): T {
  if (data instanceof Date) {
    return new Date(data) as T
  }

  if (data instanceof Set) {
    return new Set(data) as T
  }

  const dataIsArray = Array.isArray(data)

  if (!(isBrowser() && isRawData(data)) && (dataIsArray || isObject(data))) {
    if (!dataIsArray && !isPlainObject(data)) {
      return data
    }

    const copy: any = dataIsArray ? [] : {}

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        copy[key] = cloneObject(data[key])
      }
    }

    return copy
  }

  return data
}

function isRawData(value: unknown): value is Blob | FileList {
  return value instanceof Blob || value instanceof FileList
}
