import { isObject } from '../utils/is-object'

export type EmptyObject = Record<string | number, never>

export function isEmptyObject(value: unknown): value is EmptyObject {
  return isObject(value) && !Object.keys(value).length
}
