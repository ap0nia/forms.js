import { isEmptyObject } from './is-object'
import { stringToPath } from './string-to-path'

export function baseGet(object: any, updatePath: (string | number)[]) {
  const length = updatePath.slice(0, -1).length

  let index = 0

  while (index < length) {
    object = object == null ? index++ : object[updatePath[index++] as keyof typeof object]
  }

  return object
}

export function isEmptyArray(obj: unknown): obj is unknown[] {
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

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/unset.ts
 */
export function deepUnset(object: any, path: string | (string | number)[]) {
  const paths = Array.isArray(path) ? path : stringToPath(path)

  const childObject = paths.length === 1 ? object : baseGet(object, paths)

  const index = paths.length - 1

  const key = paths[index]

  if (childObject) {
    delete childObject[key as keyof typeof childObject]
  }

  if (index !== 0 && (isEmptyObject(childObject) || isEmptyArray(childObject))) {
    deepUnset(object, paths.slice(0, -1))
  }

  return object
}
