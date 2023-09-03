import { isObject } from './is-object'

export type EmptyObject = Record<PropertyKey, never>

export type AltEmptyObject = NonNullable<unknown>

export function isEmptyObject(value: unknown): value is EmptyObject {
  return isObject(value) && Object.keys(value).length === 0
}
