import type { FieldElement } from './fields'
import type { RegisterOptions } from './register'
import type { DeepRequired } from './utils/types/deep-required'
import type { LiteralUnion } from './utils/types/literal-union'
import type { Merge } from './utils/types/merge'
import type { ValidateResult } from './validation'

/**
 * Idk.
 */
export type InternalFieldErrors = Partial<Record<string, FieldError>>

/**
 * Idk.
 */
export type FieldError = {
  /**
   * Idk
   */
  type: LiteralUnion<keyof RegisterOptions, string>

  /**
   * Idk.
   */
  root?: FieldError

  /**
   * Idk.
   */
  ref?: FieldElement

  /**
   * Idk.
   */
  types?: MultipleFieldErrors

  /**
   * Idk.
   */
  message?: string
}

/**
 * Idk.
 */
export type ErrorOption = {
  /**
   * Idk.
   */
  message?: string

  /**
   * Idk.
   */
  type?: LiteralUnion<keyof RegisterOptions, string>

  /**
   * Idk.
   */
  types?: MultipleFieldErrors
}

/**
 * Idk.
 */
export type MultipleFieldErrors = {
  [K in keyof RegisterOptions]?: ValidateResult
} & Record<string, ValidateResult>

/**
 * Idk.
 */
export type FieldErrors<T extends Record<string, any> = Record<string, any>> = Partial<
  FieldErrorsImpl<DeepRequired<T>>
> & {
  root?: Record<string, GlobalError> & GlobalError
}

/**
 * Idk.
 */
export type FieldErrorsImpl<T extends Record<string, any> = Record<string, any>> = {
  [K in keyof T]?: K extends 'root' | `root.${string}`
    ? GlobalError
    : T[K] extends object
    ? Merge<FieldError, FieldErrorsImpl<T[K]>>
    : FieldError
}

/**
 * Idk.
 */
export type GlobalError = {
  /**
   * Idk.
   */
  type?: string | number

  /**
   * Idk.
   */
  message?: string
}
