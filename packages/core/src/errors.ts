import type { FieldElement } from './field'
import type { AnyRecord } from './utils/any-record'
import type { DeepMerge } from './utils/deep-merge'
import type { DeepRequired } from './utils/deep-required'
import type { IsAny } from './utils/is-any'
import type { LiteralUnion } from './utils/literal-union'
import type { RegisterOptions, ValidateResult } from './validator'

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
  ref?: FieldElement
  types?: MultipleFieldErrors
  message?: string
}

export type FieldErrorsImpl<T> = {
  [K in keyof T]?: K extends 'root' | `root.${string}`
    ? GlobalError
    : T[K] extends AnyRecord
    ? DeepMerge<FieldError, FieldErrorsImpl<T[K]>>
    : FieldError
}

export type FieldErrors<T> = Partial<
  IsAny<T> extends true ? any : FieldErrorsImpl<DeepRequired<T>>
> & {
  root?: Record<string, GlobalError> & GlobalError
}

export type InternalFieldErrors = Partial<Record<string, FieldError>>
