import { isObject } from './is-object'

/**
 * Given a dot-concatenated string path, deeply set a property, filling in any missing objects along the way.
 */
export function deepSet<T>(obj: NonNullable<unknown>, key: PropertyKey, value: unknown): T {
  if (typeof key === 'number' || typeof key === 'symbol') {
    obj[key as keyof typeof obj] = value as never
    return obj[key as keyof typeof obj] as T
  }

  const keyArray = key
    .replace(/["|']|\]/g, '')
    .split(/\.|\[/)
    .filter(Boolean)

  const lastIndex = keyArray.length - 1

  const lastKey = keyArray[lastIndex]

  const result = keyArray.reduce((currentResult, currentKey, index) => {
    if (index === lastIndex) {
      currentResult[currentKey as keyof typeof currentResult] = value as never
      return currentResult
    }

    const currentValue = currentResult[currentKey as keyof typeof currentResult]

    const fillerValue = (isNaN(keyArray[index + 1] as any) ? {} : []) as never

    if (isObject(currentValue)) {
      currentResult[currentKey as keyof typeof currentResult] ??= fillerValue
    } else {
      currentResult[currentKey as keyof typeof currentResult] = fillerValue
    }

    return currentResult[currentKey as keyof typeof currentResult]
  }, obj)

  return result[lastKey as keyof typeof result] as T
}
