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
export function safeGet<T>(obj: NonNullable<unknown>, key: string): T {
  const keyArray = key.split(/[,[\].]+?/)

  const result = keyArray.reduce((currentResult, currentKey) => {
    return currentResult == null
      ? currentResult
      : currentResult[currentKey as keyof typeof currentResult]
  }, obj)

  return (result != null && result != obj ? result : obj[key as keyof typeof obj]) as T
}
