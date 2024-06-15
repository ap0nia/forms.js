import { isObject } from './is-object'

export function isPlainObject(tempObject: object) {
  const prototypeCopy = tempObject.constructor && tempObject.constructor.prototype
  // eslint-disable-next-line no-prototype-builtins
  return isObject(prototypeCopy) && prototypeCopy.hasOwnProperty('isPrototypeOf')
}
