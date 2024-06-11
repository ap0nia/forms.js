import { isObject } from './is-object'
import type { Nullish } from './null'

export function get<T>(object: T, path?: PropertyKey | Nullish, defaultValue?: unknown): any {
  if (path == null || path === '' || (!isObject(object) && !Array.isArray(object))) {
    return defaultValue
  }

  if (typeof path === 'number' || typeof path === 'symbol') {
    return object[path as never]
  }

  const result = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((result, key) => (result == null ? result : result[key as never]), object)

  return result === undefined || result === object
    ? object[path as never] === undefined
      ? defaultValue
      : object[path as never]
    : result
}

/**
 * Safely accesses an unknown object with a variety of possible keys:
 *
 * - nullish value (returns the entire object)
 * - a single dot-concatenated string path
 * - an array of dot-concatenated string paths
 *
 * @remarks
 * It will not define any missing properties, and instead returns early if a nested property can't be reached.
 *
 * @example
 *
 * ```ts
 * const obj = { foo: { bar: { baz: 'qux' } } }
 *
 * const result1 = getMultiple(obj, null)
 * console.log(result1) // { foo: { bar: { baz: 'qux' } } }
 *
 * const result2 = getMultiple(obj, 'foo.bar.baz')
 * console.log(result2) // 'qux'
 *
 * const result3 = getMultiple(obj, ['foo.bar.baz', 'foo.bar.qux'])
 * console.log(result3) // ['qux', undefined]
 * ```
 */
export function getMultiple<T = any>(
  obj: NonNullable<unknown>,
  key?: Nullish | PropertyKey | PropertyKey[] | readonly PropertyKey[],
): T {
  if (key == null) {
    return obj as T
  }

  return (Array.isArray(key) ? key.map((currentKey) => get(obj, currentKey)) : get(obj, key)) as T
}
