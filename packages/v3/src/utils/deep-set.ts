/**
 * Given a dot-concatenated string path, deeply set a property,
 * filling in any missing objects along the way.
 */
export function deepSet<T>(obj: NonNullable<unknown>, key: string, value: unknown): T {
  const keyArray = key
    .replace(/["|']|\]/g, '')
    .split(/\.|\[/)
    .filter(Boolean)

  const lastIndex = keyArray.length - 1

  const result = keyArray.reduce((currentResult, currentKey, index) => {
    const currentValue = currentResult[currentKey as keyof typeof currentResult]

    const valueToSet =
      index === lastIndex
        ? value
        : currentValue != null
        ? currentValue
        : isNaN(keyArray[index + 1] as any)
        ? {}
        : []

    currentResult[currentKey as keyof typeof currentResult] = valueToSet as never

    return currentResult[currentKey as keyof typeof currentResult]
  }, obj)

  return result as T
}
