import { INPUT_VALIDATION_RULES } from '../../constants'
import { fieldRefIsEmpty } from '../../utils/field-ref-is-empty'
import { setCustomValidity } from '../../utils/set-custom-validity'
import type { Field } from '../fields'
import { getValueAndMessage, type ValidationValueMessage } from '../validation'

import type { NativeValidationFunction } from './types'

export const nativeValidateMinMax: NativeValidationFunction = (context, next) => {
  const { field, errors, inputRef, inputValue, validateAllFieldCriteria, shouldSetCustomValidity } =
    context

  const { name, ref } = field._f

  const isEmpty = fieldRefIsEmpty(field, inputValue)

  const hasNoConstraints = field._f.min == null && field._f.max == null

  if (isEmpty || hasNoConstraints) {
    return next?.(context)
  }

  const { exceedMax, exceedMin, maxOutput, minOutput } = fieldExceedsBounds(field, inputValue)

  // Neither bounds were exceeded.
  if (!(exceedMax || exceedMin)) {
    return next?.(context)
  }

  const message = exceedMax ? maxOutput.message : minOutput.message

  const validationType = exceedMax ? INPUT_VALIDATION_RULES.max : INPUT_VALIDATION_RULES.min

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

type ExceedBoundsResult = {
  exceedMax: boolean
  exceedMin: boolean
  maxOutput: ValidationValueMessage
  minOutput: ValidationValueMessage
}

export function fieldExceedsBounds(field: Field, inputValue: any): ExceedBoundsResult {
  const { min, max } = field._f

  const ref = field._f.ref as HTMLInputElement

  const maxOutput = getValueAndMessage(max)

  const minOutput = getValueAndMessage(min)

  if (inputValue != null && !isNaN(inputValue)) {
    const valueNumber = ref.valueAsNumber || (inputValue ? +inputValue : inputValue)

    const exceedMax = maxOutput.value != null && valueNumber > maxOutput.value

    const exceedMin = minOutput.value != null && valueNumber < minOutput.value

    return { exceedMax, exceedMin, maxOutput, minOutput }
  }

  const valueDate = ref.valueAsDate || new Date(inputValue as string)

  const isTime = ref.type == 'time'

  const isWeek = ref.type == 'week'

  const exceedMax =
    typeof maxOutput.value === 'string' &&
    inputValue &&
    (isTime
      ? convertToDate(inputValue) > convertToDate(maxOutput.value)
      : isWeek
      ? inputValue > maxOutput.value
      : valueDate > new Date(maxOutput.value))

  const exceedMin =
    typeof minOutput.value === 'string' &&
    inputValue &&
    (isTime
      ? convertToDate(inputValue) < convertToDate(minOutput.value)
      : isWeek
      ? inputValue < minOutput.value
      : valueDate < new Date(minOutput.value))

  return { exceedMax, exceedMin, maxOutput, minOutput }
}

/**
 * Helper function that just converts some value to a date.
 */
function convertToDate(value: unknown) {
  return new Date(`${new Date().toDateString()} ${value}`)
}
