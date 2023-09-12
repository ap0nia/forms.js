import { isObject } from './guards/is-object'
import { isRegex } from './guards/is-regex'
import type { ValidationRule } from './validator'

export function getValueAndMessage(validationData?: ValidationRule) {
  return isObject(validationData) && !isRegex(validationData)
    ? validationData
    : {
        value: validationData,
        message: '',
      }
}
