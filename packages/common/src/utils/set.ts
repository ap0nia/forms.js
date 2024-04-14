import { isKey } from './is-key'
import { isObject } from './is-object'
import { stringToPath } from './string-to-path'

export function set(object: Record<string, any>, path: string, value?: unknown) {
  let index = -1
  const tempPath = isKey(path) ? [path] : stringToPath(path)
  const length = tempPath.length
  const lastIndex = length - 1

  while (++index < length) {
    const key = tempPath[index]

    if (key == null) {
      continue
    }

    let newValue = value

    if (index !== lastIndex) {
      const objValue = object[key]
      newValue =
        isObject(objValue) || Array.isArray(objValue)
          ? objValue
          : !isNaN(+(tempPath[index + 1] ?? ''))
          ? []
          : {}
    }

    object[key] = newValue

    object = object[key]
  }

  return object
}
