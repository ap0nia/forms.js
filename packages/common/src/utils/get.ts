import { isObject } from './is-object'

export function get<T>(object: T, path?: string, defaultValue?: unknown): any {
  if (!path || !isObject(object)) {
    return defaultValue
  }

  const result = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((result, key) => (result == null ? result : result[key as keyof {}]), object)

  return result === undefined || result === object
    ? object[path as keyof T] === undefined
      ? defaultValue
      : object[path as keyof T]
    : result
}
