import { INPUT_VALIDATION_RULES } from '../../constants'
import { fieldRefIsEmpty } from '../../utils/field-ref-is-empty'
import { setCustomValidity } from '../../utils/set-custom-validity'
import { getValueAndMessage } from '../validation'

import type { NativeValidationFunction } from './types'

export const nativeValidateMinMaxLength: NativeValidationFunction = (context, next) => {
  const {
    field,
    errors,
    inputRef,
    inputValue,
    isFieldArray,
    validateAllFieldCriteria,
    shouldSetCustomValidity,
  } = context

  const { name, ref } = field._f

  const hasLength = typeof inputValue === 'string' || (isFieldArray && Array.isArray(inputValue))

  const isEmpty = fieldRefIsEmpty(field, inputValue)

  const hasNoConstraints = field._f.maxLength == null && field._f.minLength == null

  if (isEmpty || !hasLength || hasNoConstraints) {
    return next?.(context)
  }

  const maxLengthOutput = getValueAndMessage(field._f.maxLength)

  const minLengthOutput = getValueAndMessage(field._f.minLength)

  const exceedMax = maxLengthOutput.value != null && inputValue.length > +maxLengthOutput.value

  const exceedMin = minLengthOutput.value != null && inputValue.length < +minLengthOutput.value

  if (!(exceedMax || exceedMin)) {
    return next?.(context)
  }

  const message = exceedMax ? maxLengthOutput.message : minLengthOutput.message

  const validationType = exceedMax
    ? INPUT_VALIDATION_RULES.maxLength
    : INPUT_VALIDATION_RULES.minLength

  errors[name] = {
    type: validationType,
    message,
    ref,
    ...(validateAllFieldCriteria && {
      ...errors[name],
      types: {
        ...errors[name]?.types,
        [validationType]: message || true,
      },
    }),
  }

  if (!validateAllFieldCriteria) {
    if (shouldSetCustomValidity) {
      setCustomValidity(inputRef, errors[name]?.message)
    }
    return
  }

  return next?.(context)
}
