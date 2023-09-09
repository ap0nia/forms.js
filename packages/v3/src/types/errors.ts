import type { BrowserNativeObject } from '../type-utils/browser'
import type { DeepRequired } from '../type-utils/deep-required'
import type { IsAny } from '../type-utils/is-any'

import type { FieldValues, InternalFieldName, Ref } from './fields'
import type { LiteralUnion, Merge } from './utils'
import type { RegisterOptions, ValidateResult } from './validator'

/**
 * FIXME: Don't need to abstract this type.
 */
export type Message = string

export type GlobalError = {
  type?: string | number
  message?: string
}

export type MultipleFieldErrors = {
  [K in keyof RegisterOptions]?: ValidateResult
} & {
  [key: string]: ValidateResult
}

export type FieldError = {
  type: LiteralUnion<keyof RegisterOptions, string>
  root?: FieldError
  ref?: Ref
  types?: MultipleFieldErrors
  message?: Message
}

export type FieldErrorsImpl<T extends FieldValues = FieldValues> = {
  [K in keyof T]?: T[K] extends BrowserNativeObject | Blob
    ? FieldError
    : K extends 'root' | `root.${string}`
    ? GlobalError
    : T[K] extends object
    ? Merge<FieldError, FieldErrorsImpl<T[K]>>
    : FieldError
}

export type FieldErrors<T extends FieldValues = FieldValues> = Partial<
  FieldValues extends IsAny<FieldValues> ? any : FieldErrorsImpl<DeepRequired<T>>
> & {
  root?: Record<string, GlobalError> & GlobalError
}

export type InternalFieldErrors = Partial<Record<InternalFieldName, FieldError>>
