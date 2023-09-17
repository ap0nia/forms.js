import { isObject } from '../../utils/is-object'
import type { ValidationRule, ValidationValueMessage } from '../validation'

/**
 * Helper function to get the value and message from a validation rule.
 */
export function getValueAndMessage(validationRule?: ValidationRule): ValidationValueMessage {
  return isObject(validationRule) && !(validationRule instanceof RegExp)
    ? validationRule
    : { value: validationRule, message: '' }
}
