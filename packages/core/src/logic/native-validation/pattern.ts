import { INPUT_VALIDATION_RULES } from '../../constants'
import { fieldRefIsEmpty } from '../../utils/field-ref-is-empty'
import { setCustomValidity } from '../../utils/set-custom-validity'
import { getValueAndMessage } from '../validation'

import type { NativeValidationFunction } from './types'

export const nativeValidatePattern: NativeValidationFunction = (context, next) => {
  const { field, errors, inputRef, inputValue, validateAllFieldCriteria, shouldSetCustomValidity } =
    context

  const { name, ref } = field._f

  const isEmpty = fieldRefIsEmpty(field, inputValue)

  if (field._f.pattern == null || isEmpty || typeof inputValue !== 'string') {
    return next?.(context)
  }

  const { value, message } = getValueAndMessage(field._f.pattern)

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
