import type { Nullish } from './null'

/**
 * Safely accesses an unknown object with a dot-concatenated string path.
 *
 * @remarks
 * It will not define any missing properties, and instead returns early if a nested property can't be reached.
 *
 * @example
 *
 * ```ts
 * const key = 'foo.bar.baz'
 * const obj = { foo: { bar: { baz: 'qux' } } }
 * const result = deepGet<string>(obj, key)
 * console.log(result) // 'qux'
 * ```
 */
export function safeGet<T = any>(obj: unknown, key?: PropertyKey | Nullish): T {
  if (key == null || obj == null) {
    return obj as T
  }

  if (typeof key === 'number' || typeof key === 'symbol') {
    return obj[key as keyof typeof obj] as T
  }

  const keyArray = key.split(/[,[\].]+?/).filter(Boolean)

  const result = keyArray.reduce((currentResult, currentKey) => {
    return currentResult == null
      ? currentResult
      : currentResult[currentKey as keyof typeof currentResult]
  }, obj)

  return (result == null || result === obj ? obj[key as keyof typeof obj] : result) as T
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
export function safeGetMultiple<T = any>(
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
