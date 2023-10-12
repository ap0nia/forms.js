import type { FlattenObject } from './utils/types/flatten-object'

export * from './constants'
export * from './form-control'
export * from './types/errors'
export * from './types/fields'
export * from './types/plugin'
export * from './types/register'
export * from './types/resolver'
export * from './types/validation'

export type FieldValues = Record<string, any>

export type FieldPath<T> = Extract<keyof FlattenObject<T>, string>
