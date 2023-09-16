/**
 * An empty object.
 */
export type EmptyObject = NonNullable<unknown>

/**
 * Whether the value is an object, i.e. some sort of record.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isObject.ts
 */
export function isObject<T extends EmptyObject>(value: unknown): value is T {
  return (
    value != null && !Array.isArray(value) && typeof value === 'object' && !(value instanceof Date)
  )
}

/**
 * What's a plain object?
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isPlainObject.ts
 */
export function isPlainObject<T extends EmptyObject = EmptyObject>(value: T): boolean {
  const prototypeCopy = value.constructor?.prototype

  return (
    isObject(prototypeCopy) && Object.prototype.hasOwnProperty.call(prototypeCopy, 'isPrototypeOf')
  )
}
