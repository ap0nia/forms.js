import type { DeepMerge } from '../utils/deep-merge'
import type { DeepRequired } from '../utils/deep-required'
import type { LiteralUnion } from '../utils/literal-union'

import type { FieldElement } from './fields'
import type { RegisterOptions } from './register'
import type { ValidateResult } from './validation'

/**
 * A record of field names mapped to their errors.
 *
 * These errors are generated as an intermediary step before being converted to a {@link FieldErrors} object.
 */
export type FieldErrorRecord = Partial<Record<string, FieldError>>

/**
 * An error generated by a field during validation.
 */
export type FieldError = {
  /**
   * The field element that the error is attached to.
   */
  ref?: FieldElement

  /**
   * If accummulating multiple errors, this is a record of errors mapped to their messages (or true if no message).
   */
  types?: MultipleFieldErrors

  /**
   * The parsed message from the validation rule.
   */
  message?: string

  /**
   * Field array errors will be grouped under the `root` property.
   */
  root?: FieldError

  /**
   * Regular errors will have a `type` property indicating what kind of error occurred.
   */
  type?: LiteralUnion<keyof RegisterOptions, string>
}

/**
 * Options when manually setting an error.
 */
export type ErrorOption = {
  /**
   * The error message.
   */
  message?: string

  /**
   * The error type.
   */
  type?: LiteralUnion<keyof RegisterOptions, string>

  /**
   * A record of errors mapped to their messages.
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
 * A record of field names mapped to their errors.
 *
 * This is the exposed interface for the form's stored errors.
 */
export type FieldErrors<T = Record<string, any>> = Partial<FieldErrorsInternal<DeepRequired<T>>> & {
  root?: Record<string, GlobalError> & GlobalError
}

/**
 * Does the actual mapping of field names to their errors.
 */
export type FieldErrorsInternal<T = Record<string, any>> = {
  [K in keyof T]?: K extends 'root' | `root.${string}`
    ? GlobalError
    : T[K] extends (infer U)[]
    ? FieldError | { [k in keyof U]?: FieldError }[]
    : T[K] extends object
    ? DeepMerge<FieldError, FieldErrorsInternal<T[K]>>
    : FieldError
}

/**
 * Probably top-level errors for field arrays.
 */
export type GlobalError = {
  /**
   * The error type.
   */
  type?: string | number

  /**
   * The error message.
   */
  message?: string
}
