import { isObject } from './isObject'

export type EmptyObject = Record<PropertyKey, never>

export function isEmptyObject(value: unknown): value is EmptyObject {
  return isObject(value) && Object.keys(value).length === 0
}
