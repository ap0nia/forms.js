import type { MaybePromise } from '../utils/types/maybe-promise'

/**
 * Validation rules can be applied to fields, which are used for native validation checks.
 *
 * Just the value, or a value and a custom error message can be provided.
 */
export type ValidationRule<T extends ValidationValue = ValidationValue> =
  | T
  | ValidationValueMessage<T>

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
export type ValidationValueMessage<T extends ValidationValue = ValidationValue> = {
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

// /**
//  * Helper function to get the value and message from a validation rule.
//  */
// export function getValueAndMessage(validationRule?: ValidationRule): ValidationValueMessage {
//   return isObject(validationRule) && !(validationRule instanceof RegExp)
//     ? validationRule
//     : { value: validationRule, message: '' }
// }
//
// /**
//  * Helper function to convert a {@link ValidateResult} to a {@link FieldError}.
//  */
// export function getValidateError(
//   result: ValidateResult,
//   ref: FieldElement,
//   type = 'validate',
// ): FieldError | void {
//   if (
//     typeof result === 'string' ||
//     (Array.isArray(result) && result.every((r) => typeof r === 'string')) ||
//     result === false
//   ) {
//     return {
//       type,
//       message: typeof result === 'string' ? result : '',
//       ref,
//     }
//   }
// }
