import type { FieldError } from './errors'
import type { FieldElement } from './field'
import { isBoolean } from './guards/is-boolean'
import { isString } from './utils/is-string'
import type { ValidateResult } from './validator'

export function getValidateError(
  result: ValidateResult,
  ref: FieldElement,
  type = 'validate',
): FieldError | void {
  if (
    isString(result) ||
    (Array.isArray(result) && result.every(isString)) ||
    (isBoolean(result) && !result)
  ) {
    return {
      type,
      message: isString(result) ? result : '',
      ref,
    }
  }
}
