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
