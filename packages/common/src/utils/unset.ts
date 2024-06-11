import { isEmptyObject } from './is-empty-object'
import { isKey } from './is-key'
import { isObject } from './is-object'
import { stringToPath } from './string-to-path'

function baseGet(object: any, updatePath: PropertyKey[]) {
  const length = updatePath.slice(0, -1).length
  let index = 0

  while (index < length) {
    const key = updatePath[index++]

    if (key != null) {
      object = object === undefined ? index++ : object[key]
    }
  }

  return object
}

function isEmptyArray(obj: unknown[]) {
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      return false
    }
  }
  return true
}

export function unset(object: any, path: PropertyKey | PropertyKey[]) {
  if (typeof path === 'number' || typeof path === 'symbol') {
    delete object[path]
    return object
  }

  const paths = Array.isArray(path) ? path : isKey(path) ? [path] : stringToPath(path)

  const childObject = paths.length === 1 ? object : baseGet(object, paths)

  const index = paths.length - 1
  const key = paths[index]

  if (childObject && key != null) {
    delete childObject[key]
  }

  if (
    index !== 0 &&
    ((isObject(childObject) && isEmptyObject(childObject)) ||
      (Array.isArray(childObject) && isEmptyArray(childObject)))
  ) {
    unset(object, paths.slice(0, -1))
  }

  return object
}
