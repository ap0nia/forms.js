import { isObject } from '@hookform/common/utils/is-object'

import type { ValidationRule, ValidationValueMessage } from '../../types/validation'

/**
 * Helper function to get the value and message from a validation rule.
 */
export function parseValidationRule(validationRule?: ValidationRule): ValidationValueMessage {
  return isObject(validationRule) && !(validationRule instanceof RegExp)
    ? validationRule
    : { value: validationRule, message: '' }
}
