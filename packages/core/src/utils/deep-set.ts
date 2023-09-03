import { isObject } from '../guards/is-object'
import type { AnyRecord } from './any-record'
import { isKey } from './is-key'
import { stringToPath } from './string-to-path'

export function deepSet(object: AnyRecord, path: string, value?: unknown) {
  const tempPath = isKey(path) ? [path] : stringToPath(path)
  const length = tempPath.length
  const lastIndex = length - 1

  let index = -1
  let key: string | undefined
  let newValue: unknown
  let objValue: unknown

  while (++index < length) {
    key = tempPath[index]

    if (key == null) {
      continue
    }

    newValue = value

    if (index !== lastIndex) {
      objValue = object[key]

      newValue =
        isObject(objValue) || Array.isArray(objValue)
          ? objValue
          : !isNaN(Number(tempPath[index + 1]))
            ? []
            : {}
    }

    object[key] = newValue
    object = object[key]
  }

  return object
}
