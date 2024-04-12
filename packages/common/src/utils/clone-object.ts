import { isBrowser } from './is-browser'
import { isObject } from './is-object'
import { isPlainObject } from './is-plain-object'
import { isRawData } from './is-raw-data'

export function cloneObject<T>(data: T): T {
  if (data instanceof Date) {
    return new Date(data) as T
  }

  if (data instanceof Set) {
    return new Set(data) as T
  }

  const isArray = Array.isArray(data)

  if ((isBrowser && isRawData(data)) || !(isArray || isObject(data))) {
    return data
  }

  if (!isArray && !isPlainObject(data)) {
    return data
  }

  const copy: any = isArray ? [] : {}

  for (const key in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(key)) {
      copy[key] = cloneObject(data[key])
    }
  }

  return copy
}
