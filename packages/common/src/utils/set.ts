import { isKey } from './is-key'
import { isObject } from './is-object'
import { stringToPath } from './string-to-path'

export function set(object: Record<string, any>, path: PropertyKey, value?: unknown) {
  if (typeof path === 'number' || typeof path === 'symbol') {
    object[path as keyof {}] = value
    return object
  }

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
