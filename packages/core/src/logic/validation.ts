import { isObject } from '../utils/is-object'

import type { FieldError, InternalFieldErrors } from './errors'
import type { FieldElement } from './fields'

/**
 * Not sure what this is for.
 */
export type ValidationValue = boolean | number | string | RegExp

/**
 * Maybe this is referenced when displaying validation errors?
 */
export type ValidationValueMessage<T = ValidationValue> = {
  value?: T
  message: string
}

/**
 * Validation rules can be applied to fields, which are used for native validation checks.
 */
export type ValidationRule<T = ValidationValue> = T | ValidationValueMessage<T>

/**
 * Not sure what this is for.
 */
export type ValidateResult = string | string[] | boolean | undefined

/**
 * A validator function.
 */
export type Validate<TFieldValue, TFormValues> = (
  value: TFieldValue,
  formValues: TFormValues,
) => ValidateResult | Promise<ValidateResult>

export type ValidationOptions = {
  /**
   * Whether to exit immediately upon encountering the first error for the __form__.
   */
  validateAllFieldCriteria?: boolean

  /**
   * Whether to exit immediately upon encountering the first error for a __field__.
   */
  shouldDisplayAllAssociatedErrors?: boolean

  /**
   * Whether to set the custom validity on the input element.
   *
   * i.e. Using the {@link HTMLInputElement.setCustomValidity} API.
   */
  shouldUseNativeValidation?: boolean

  /**
   * Callback to determine if a field is a field array root.
   *
   * Should be handled by a parent FormControl.
   */
  isFieldArrayRoot?: (name: string) => boolean

  /**
   * Callback to execute after validation.
   *
   * Should be handled by a parent {@link FormControl}.
   */
  afterValidation?: (name: string, error: InternalFieldErrors, isFieldArrayRoot?: boolean) => void
}

/**
 * Helper function to get the value and message from a validation rule.
 */
export function getValueAndMessage(validationRule?: ValidationRule): ValidationValueMessage {
  if (typeof validationRule === 'string') {
    return { value: Boolean(validationRule), message: validationRule }
  }

  if (isObject(validationRule) && !(validationRule instanceof RegExp)) {
    return validationRule
  }

  return { value: validationRule, message: '' }
}

/**
 * Helper function to convert a {@link ValidateResult} to a {@link FieldError}.
 */
export function getValidateError(
  result: ValidateResult,
  ref: FieldElement,
  type = 'validate',
): FieldError | void {
  if (
    typeof result === 'string' ||
    (Array.isArray(result) && result.every((r) => typeof r === 'string')) ||
    result === false
  ) {
    return {
      type,
      message: typeof result === 'string' ? result : '',
      ref,
    }
  }
}
