import type { MaybePromise } from '../utils/types/maybe-promise'

/**
 * Validation rules can be applied to fields, which are used for native validation checks.
 *
 * Just the value, or a value and a custom error message can be provided.
 */
export type ValidationRule<T = ValidationValue> = T | ValidationValueMessage<T>

/**
 * The value for a validation rule.
 *
 * @example
 * If the value, 5, is provided for "maxLength",
 * then the field will be validated to ensure that it is less than 5 characters.
 */
export type ValidationValue = boolean | number | string | RegExp

/**
 * A value and message can be provided for a validation type.
 * The value is used for the validation check,
 * and the message is used to customize the error message displayed when validation fails.
 */
export type ValidationValueMessage<T = ValidationValue> = {
  value?: T
  message: string
}

/**
 * A validator function.
 */
export type Validate<TFieldValue, TFormValues> = (
  value: TFieldValue,
  formValues: TFormValues,
) => MaybePromise<ValidateResult>

/**
 * Validator functions can return different things.
 */
export type ValidateResult = string | string[] | boolean | undefined
