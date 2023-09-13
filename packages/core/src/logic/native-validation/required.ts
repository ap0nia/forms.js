import { INPUT_VALIDATION_RULES } from '../../constants'
import { fieldRefIsEmpty } from '../../utils/field-ref-is-empty'
import { getCheckboxValue, isCheckBoxInput } from '../../utils/html/checkbox'
import { getRadioValue, isRadioInput } from '../../utils/html/radio'
import { setCustomValidity } from '../../utils/set-custom-validity'
import type { Field } from '../fields'
import { getValueAndMessage } from '../validation'

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

  const { name } = field._f

  if (!requiredButMissing(field, inputValue, isFieldArray)) {
    return next?.(context)
  }

  const { value, message } = getValueAndMessage(field._f.required)

  if (value == null) {
    return next?.(context)
  }

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

function requiredButMissing(field: Field, inputValue: any, isFieldArray?: boolean) {
  // Invalid field array.
  if (isFieldArray && (!Array.isArray(inputValue) || !inputValue.length)) {
    return true
  }

  // If the field is not required, then it isn't missing.
  if (!field._f.required) {
    return false
  }

  const isRadio = isRadioInput(field._f.ref)
  const isCheckBox = isCheckBoxInput(field._f.ref)
  const isRadioOrCheckbox = isRadio || isCheckBox
  const isEmpty = fieldRefIsEmpty(field, inputValue)

  // If it's __not__ a radio or checkbox and there's no value, then it's missing.
  if (!isRadioOrCheckbox && (isEmpty || inputValue == null)) {
    return true
  }

  // If the input value is false, it's missing?
  if (inputValue === false) {
    return true
  }

  // Invalid checkbox value.
  if (isCheckBox && !getCheckboxValue(field._f.refs).isValid) {
    return true
  }

  // Invalid radio value.
  if (isRadio && !getRadioValue(field._f.refs).isValid) {
    return true
  }

  return false
}
