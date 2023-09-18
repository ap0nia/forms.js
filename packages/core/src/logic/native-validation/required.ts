import { INPUT_VALIDATION_RULES } from '../../constants'
import type { Field } from '../fields'
import { fieldIsEmpty } from '../helpers/field-is-empty'
import { parseValidationRule } from '../helpers/parse-validation-rule'
import { setCustomValidity } from '../helpers/set-custom-validity'
import { getCheckBoxValue, isCheckBoxInput } from '../html/checkbox'
import { getRadioValue, isRadioInput } from '../html/radio'

import type { NativeValidationFunction } from './types'

export const nativeValidateRequired: NativeValidationFunction = (context, next) => {
  const {
    field,
    errors,
    inputRef,
    inputValue,
    isFieldArray,
    validateAllFieldCriteria,
    shouldSetCustomValidity,
  } = context

  const { name, required } = field._f

  // This field isn't required, so no validation needed.
  if (!requiredButMissing(field, inputValue, isFieldArray)) {
    return next?.(context)
  }

  const message = typeof required === 'string' ? required : parseValidationRule(required).message

  errors[name] = {
    type: INPUT_VALIDATION_RULES.required,
    message,
    ref: inputRef,
    ...(validateAllFieldCriteria && {
      ...errors[name],
      types: {
        ...errors[name]?.types,
        [INPUT_VALIDATION_RULES.required]: message || true,
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

export function requiredButMissing(field: Field, inputValue: any, isFieldArray?: boolean) {
  // Invalid field array.
  if (isFieldArray && (!Array.isArray(inputValue) || !inputValue.length)) {
    return true
  }

  // If the field is not required, then it isn't missing.
  if (!field._f.required) {
    return false
  }

  const isEmpty = fieldIsEmpty(field, inputValue)

  const isRadio = isRadioInput(field._f.ref)

  const isCheckBox = isCheckBoxInput(field._f.ref)

  const isRadioOrCheckbox = isRadio || isCheckBox

  // If it's __not__ a radio or checkbox and there's no value, then it's missing.
  if (!isRadioOrCheckbox && (isEmpty || inputValue == null)) {
    return true
  }

  // A required radio or checkbox input is missing if it's false.
  if (inputValue === false) {
    return true
  }

  // Invalid checkbox value.
  if (isCheckBox && !getCheckBoxValue(field._f.refs).isValid) {
    return true
  }

  // Invalid radio value.
  if (isRadio && !getRadioValue(field._f.refs).isValid) {
    return true
  }

  return false
}
