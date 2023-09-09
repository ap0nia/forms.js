import type { Nullish } from '../types/utils'

/**
 * Safely accesses an unknown object with a dot-concatenated string path.
 *
 * @remarks
 * It will not define any missing properties.
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
    return undefined as T
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
