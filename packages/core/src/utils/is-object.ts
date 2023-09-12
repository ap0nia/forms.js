export const isObjectType = (value: unknown) => typeof value === 'object'

export function isObject<T extends object>(value: unknown): value is T {
  return value != null && !Array.isArray(value) && isObjectType(value) && !(value instanceof Date)
}

export function isPlainObject(tempObject: object) {
  const prototypeCopy = tempObject.constructor && tempObject.constructor.prototype

  return (
    isObject(prototypeCopy) && Object.prototype.hasOwnProperty.call(prototypeCopy, 'isPrototypeOf')
  )
}
