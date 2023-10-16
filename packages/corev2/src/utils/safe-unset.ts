import { isObject } from './is-object'

export function safeUnset<T>(obj: T, path?: string, defaultValue?: unknown): any {
  if (!path || !isObject(obj)) {
    return defaultValue
  }

  const result = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((result, key) => (result == null ? result : result[key as keyof {}]), obj)

  return result == null || result === obj
    ? obj[path as keyof T] == null
      ? defaultValue
      : obj[path as keyof T]
    : result
}
