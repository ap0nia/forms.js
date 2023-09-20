import { INPUT_VALIDATION_RULES } from '../../constants'
import { fieldIsEmpty } from '../helpers/field-is-empty'
import { parseValidationRule } from '../helpers/parse-validation-rule'
import { setCustomValidity } from '../helpers/set-custom-validity'

import type { NativeValidationFunction } from './types'

export const nativeValidatePattern: NativeValidationFunction = (context, next) => {
  const { field, errors, inputRef, inputValue, validateAllFieldCriteria, shouldSetCustomValidity } =
    context

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
    type: INPUT_VALIDATION_RULES.pattern,
    message,
    ref,
    ...(validateAllFieldCriteria && {
      ...errors[name],
      types: {
        ...errors[name]?.types,
        [INPUT_VALIDATION_RULES.pattern]: message || true,
      },
    }),
  }

  if (!validateAllFieldCriteria) {
    if (shouldSetCustomValidity) {
      setCustomValidity(inputRef, message)
    }
    return
  }

  return next?.(context)
}
