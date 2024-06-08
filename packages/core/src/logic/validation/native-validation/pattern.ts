import { INPUT_VALIDATION_RULE } from '../../../constants'
import { fieldIsEmpty } from '../../fields/field-is-empty'
import { setCustomValidity } from '../../html/set-custom-validity'
import { parseValidationRule } from '../../validation/parse-validation-rule'

import type { NativeValidationFunction } from './types'

export const nativeValidatePattern: NativeValidationFunction = (context, next) => {
  const {
    field,
    errors,
    inputRef,
    inputValue,
    validateAllFieldCriteria,
    shouldSetCustomValidity,
    appendErrorsCurry,
  } = context

  const { name, ref } = field._f

  const isEmpty = fieldIsEmpty(field, inputValue)

  if (field._f.pattern == null || isEmpty || typeof inputValue !== 'string') {
    return next?.(context)
  }

  const { value, message } = parseValidationRule(field._f.pattern)

  if (!(value instanceof RegExp) || inputValue.match(value)) {
    return next?.(context)
  }

  errors[name] = {
    type: INPUT_VALIDATION_RULE.pattern,
    message,
    ref,
    ...appendErrorsCurry(INPUT_VALIDATION_RULE.pattern, message),
    // ...(validateAllFieldCriteria && {
    //   ...errors[name],
    //   types: {
    //     ...errors[name]?.types,
    //     [INPUT_VALIDATION_RULE.pattern]: message || true,
    //   },
    // }),
  }

  if (!validateAllFieldCriteria) {
    if (shouldSetCustomValidity) {
      setCustomValidity(inputRef, message)
    }
    return
  }

  return next?.(context)
}
