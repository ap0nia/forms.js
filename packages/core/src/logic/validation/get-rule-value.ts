import type {
  ValidationRule,
  ValidationValue,
  ValidationValueMessage,
} from '../../types/validation'
import { isObject } from '../../utils/is-object'

export function getRuleValue<T extends ValidationValue>(
  rule?: ValidationRule<T> | ValidationValueMessage<T>,
) {
  return rule == null
    ? rule
    : rule instanceof RegExp
    ? rule.source
    : isObject(rule)
    ? rule.value instanceof RegExp
      ? rule.value.source
      : rule.value
    : rule
}
