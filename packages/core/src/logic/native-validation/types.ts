import type { Nullish } from '../../utils/null'
import type { MaybePromise } from '../../utils/types/maybe-promise'
import type { InternalFieldErrors } from '../errors'
import type { Field } from '../fields'

/**
 * All native validators accept a context object to perform their validation.
 */
export type NativeValidationContext = {
  /**
   * The field itself.
   */
  field: Field

  /**
   * An errors object that the validator can add errors to.
   *
   * @remarks It maybe be mutated by the validator.
   */
  errors: InternalFieldErrors

  /**
   * The input element that the field is bound to.
   */
  inputRef: HTMLInputElement

  /**
   * The current value of the field.
   */
  inputValue: any

  /**
   * The current form values.
   */
  formValues: any

  /**
   * Whether the field is a field array.
   */
  isFieldArray?: boolean

  /**
   * Whether to run all validations possible.
   *
   * i.e. "Whether to exit immediately upon encountering the first error."
   */
  validateAllFieldCriteria?: boolean

  /**
   * Whether to set the custom validity on the input element.
   *
   * i.e. Using the {@link HTMLInputElement.setCustomValidity} DOM API.
   */
  shouldSetCustomValidity: boolean
}

/**
 * Native validation functions can be chainged, using an Express.js-like interface.
 */
export type NativeValidationFunction = (
  context: NativeValidationContext,
  next?: NativeValidationFunction,
) => MaybePromise<NativeValidationResult | Nullish>

/**
 * All native validators could return something.
 */
export type NativeValidationResult = {
  /**
   * Names of fields that were affected.
   */
  names: string[]

  /**
   * Errors generated by the validator.
   */
  errors: InternalFieldErrors

  /**
   * Whether the validation was successful.
   */
  valid: boolean
}
