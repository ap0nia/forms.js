import type { Stage } from '../../constants'
import type { FieldErrors } from '../../types/errors'
import type { DeepMap } from '../../utils/types/deep-map'
import type { DeepPartial } from '../../utils/types/deep-partial'

/**
 * Overall form state.
 */
export type FormControlState<T> = {
  /**
   * Whether any of the fields have been modified.
   */
  isDirty: boolean

  /**
   * Whether the form is currently loading its default values.
   * i.e. if it's a promise or a function that returned a promise.
   */
  isLoading: boolean

  /**
   * Whether the form has been submitted.
   */
  isSubmitted: boolean

  /**
   * Whether the form has been submitted successfully.
   */
  isSubmitSuccessful: boolean

  /**
   * Whether the form is currently submitting.
   */
  isSubmitting: boolean

  /**
   * Whether the form is currently validating.
   */
  isValidating: boolean

  /**
   * Whether the form is valid.
   */
  isValid: boolean

  /**
   * The number of times the form has been submitted.
   */
  submitCount: number

  /**
   * Fields that have been modified.
   */
  dirtyFields: Partial<Readonly<DeepMap<T, boolean>>>

  /**
   * Fields that have been touched.
   */
  touchedFields: Partial<Readonly<DeepMap<T, boolean>>>

  /**
   * Default field values.
   */
  defaultValues: DeepPartial<T>

  /**
   * The current form values.
   */
  values: T

  /**
   * A record of field names mapped to their errors.
   */
  errors: FieldErrors<T>

  /**
   * The rendering status of the form control.
   */
  status: FormControlStatus
}

/**
 * The current rendering status of the form control.
 * i.e. For managing lifetimes in UI frameworks.
 */
export type FormControlStatus = { [K in Stage[keyof Stage]]: boolean }
