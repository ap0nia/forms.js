import { INPUT_VALIDATION_RULE } from '../../../constants'
import { fieldIsEmpty } from '../../fields/field-is-empty'
import { setCustomValidity } from '../../html/set-custom-validity'
import { parseValidationRule } from '../../validation/parse-validation-rule'

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
    appendErrorsCurry,
  } = context

  const { name, ref } = field._f

  const hasLength = typeof inputValue === 'string' || (isFieldArray && Array.isArray(inputValue))

  const isEmpty = fieldIsEmpty(field, inputValue)

  const hasNoConstraints = field._f.maxLength == null && field._f.minLength == null

  // Nothing to validate.
  if (isEmpty || !hasLength || hasNoConstraints) {
    return next?.(context)
  }

  const parsedMaxLengthRule = parseValidationRule(field._f.maxLength)

  const parsedMinLengthRule = parseValidationRule(field._f.minLength)

  const exceedMax =
    parsedMaxLengthRule.value != null && inputValue.length > +parsedMaxLengthRule.value

  const exceedMin =
    parsedMinLengthRule.value != null && inputValue.length < +parsedMinLengthRule.value

  // Neither bounds were exceeded.
  if (!(exceedMax || exceedMin)) {
    return next?.(context)
  }

  // Either bound was exceeded. `maxLength` has higher priority.

  const message = exceedMax ? parsedMaxLengthRule.message : parsedMinLengthRule.message

  const validationType = exceedMax
    ? INPUT_VALIDATION_RULE.maxLength
    : INPUT_VALIDATION_RULE.minLength

  errors[name] = {
    type: validationType,
    message,
    ref,
    ...appendErrorsCurry(validationType, message),
    // ...(validateAllFieldCriteria && {
    //   ...errors[name],
    //   types: {
    //     ...errors[name]?.types,
    //     [validationType]: message || true,
    //   },
    // }),
  }

  if (!validateAllFieldCriteria) {
    if (shouldSetCustomValidity) {
      setCustomValidity(inputRef, errors[name]?.message)
    }
    return
  }

  return next?.(context)
}
