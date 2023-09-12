import { isEmptyObject } from '../guards/is-empty-object'
import { isNullish } from '../guards/is-nullish'
import { isObject } from '../guards/is-object'

import { isKey } from './is-key'
import { stringToPath } from './string-to-path'

function baseGet(object: any, updatePath: (string | number)[]) {
  const length = updatePath.slice(0, -1).length

  let index = 0

  while (index < length) {
    object = isNullish(object) ? index++ : object[updatePath[index++] ?? '']
  }

  return object
}

function isEmptyArray(obj: unknown[]) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !isNullish(obj[key])) {
      return false
    }
  }
  return true
}

export function deepUnset(object: any, path: string | (string | number)[]) {
  const paths = Array.isArray(path) ? path : isKey(path) ? [path] : stringToPath(path)

  const childObject = paths.length === 1 ? object : baseGet(object, paths)

  const index = paths.length - 1

  const key = paths[index]

  if (key == null) {
    return object
  }

  if (childObject) {
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
