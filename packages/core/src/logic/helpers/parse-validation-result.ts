import type { FieldError } from '../errors'
import type { FieldElement } from '../fields'
import type { ValidateResult } from '../validation'

/**
 * Helper function to convert a {@link ValidateResult} to a {@link FieldError}.
 */
export function parseValidationResult(
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
