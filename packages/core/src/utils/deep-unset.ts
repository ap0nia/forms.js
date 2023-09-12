import { isEmptyObject } from './is-empty-object'
import { stringToPath } from './string-to-path'

function baseGet(object: any, updatePath: (string | number)[]) {
  const length = updatePath.slice(0, -1).length

  let index = 0

  while (index < length) {
    object = object == null ? index++ : object[updatePath[index++] as keyof typeof object]
  }

  return object
}

function isEmptyArray(obj: unknown): obj is unknown[] {
  if (!Array.isArray(obj)) {
    return false
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null) {
      return false
    }
  }

  return true
}

export function deepUnset(object: any, path: string | (string | number)[]) {
  const paths = Array.isArray(path) ? path : stringToPath(path)

  const childObject = paths.length === 1 ? object : baseGet(object, paths)

  const index = paths.length - 1

  const key = paths[index]

  if (childObject) {
    delete childObject[key as keyof typeof childObject]
  }

  if (index === 0 && (isEmptyObject(childObject) || isEmptyArray(childObject))) {
    deepUnset(object, paths.slice(0, -1))
  }

  return object
}
