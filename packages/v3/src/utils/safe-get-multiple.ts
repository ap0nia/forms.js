import type { Nullish } from '../types/utils'

import { safeGet } from './safe-get'

/**
 * Safely accesses an unknown object with a variety of possible keys:
 *
 * - nullish value (returns the entire object)
 * - a single dot-concatenated string path
 * - an array of dot-concatenated string paths
 *
 * @remarks
 * It will not define any missing properties.
 *
 * @example
 *
 * ```ts
 * const obj = { foo: { bar: { baz: 'qux' } } }
 *
 * const result1 = safeGet(obj, null)
 * console.log(result1) // { foo: { bar: { baz: 'qux' } } }
 *
 * const result2 = safeGet(obj, 'foo.bar.baz')
 * console.log(result2) // 'qux'
 *
 * const result3 = safeGet(obj, ['foo.bar.baz', 'foo.bar.qux'])
 * console.log(result3) // ['qux', undefined]
 * ```
 */
export function safeGetMultiple<T>(
  obj: NonNullable<unknown>,
  key?: Nullish | string | string[],
): T {
  if (key == null) {
    return obj as T
  }

  return (
    Array.isArray(key) ? key.map((currentKey) => safeGet(obj, currentKey)) : safeGet(obj, key)
  ) as T
}
