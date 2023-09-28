import type { FieldErrors } from '../../types/errors'
import type { Field, FieldRecord } from '../../types/fields'

/**
 * Options when setting a value.
 */
export type SetValueOptions = {
  /**
   */
  shouldValidate?: boolean

  /**
   */
  shouldDirty?: boolean

  /**
   */
  shouldTouch?: boolean
}

/**
 * Options when disabling a field.
 */
export type UpdateDisabledFieldOptions = {
  /**
   */
  disabled?: boolean

  /**
   */
  name: string

  /**
   */
  field?: Field

  /**
   */
  fields?: FieldRecord
}

export type TriggerOptions = {
  shouldFocus?: boolean
}

export type SubmitHandler<T> = (data: T, event?: Event) => unknown

export type SubmitErrorHandler<T> = (errors: FieldErrors<T>, event?: Event) => unknown
