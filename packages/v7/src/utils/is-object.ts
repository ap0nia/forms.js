/**
 * Whether the value is an object, i.e. some sort of record.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isObject.ts
 */
export function isObject<T extends object>(value: unknown): value is T {
  return (
    value != null && !Array.isArray(value) && typeof value === 'object' && !(value instanceof Date)
  )
}

/**
 * What's a plain object?
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isPlainObject.ts
 */
export function isPlainObject(value: unknown): boolean {
  if (value == null) {
    return false
  }

  const prototypeCopy = value.constructor?.prototype

  return (
    isObject(prototypeCopy) && Object.prototype.hasOwnProperty.call(prototypeCopy, 'isPrototypeOf')
  )
}

/**
 * Whether the value is an empty object.
 */
export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isObject(value) && !Object.keys(value).length
}
