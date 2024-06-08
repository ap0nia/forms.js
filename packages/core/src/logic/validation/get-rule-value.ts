import { isObject } from '@forms.js/common/utils/is-object'

import type {
  ValidationRule,
  ValidationValue,
  ValidationValueMessage,
} from '../../types/validation'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/1d0503b46cfe0589b188c4c0d9fa75f247271cf7/src/logic/getRuleValue.ts
 */
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
