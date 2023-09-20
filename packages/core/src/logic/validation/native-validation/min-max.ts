import { INPUT_VALIDATION_RULES } from '../../../constants'
import type { Field } from '../../../types/fields'
import type { ValidationValueMessage } from '../../../types/validation'
import { fieldIsEmpty } from '../../fields/field-is-empty'
import { setCustomValidity } from '../../html/set-custom-validity'
import { parseValidationRule } from '../../validation/parse-validation-rule'

import type { NativeValidationFunction } from './types'

export const nativeValidateMinMax: NativeValidationFunction = (context, next) => {
  const { field, errors, inputRef, inputValue, validateAllFieldCriteria, shouldSetCustomValidity } =
    context

  const { name, ref } = field._f

  const isEmpty = fieldIsEmpty(field, inputValue)

  const hasNoConstraints = field._f.min == null && field._f.max == null

  // Nothing to validate.
  if (isEmpty || hasNoConstraints) {
    return next?.(context)
  }

  const { exceedMax, exceedMin, maxLength, minLength } = fieldExceedsBounds(field, inputValue)

  // Neither bounds were exceeded.
  if (!(exceedMax || exceedMin)) {
    return next?.(context)
  }

  // Either bound was exceeded. `max` has higher priority.

  const message = exceedMax ? maxLength.message : minLength.message

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

/**
 * The result of comparing a field's min and max constraints to its value.
 */
export type ExceedBoundsResult = {
  /**
   * Whether the value exceeds the field's max constraint.
   */
  exceedMax: boolean

  /**
   * Whether the value exceeds the field's min constraint.
   */
  exceedMin: boolean

  /**
   * Parsed max validation rule's value and message.
   */
  maxLength: ValidationValueMessage

  /**
   * Parsed min validation rule's value and message.
   */
  minLength: ValidationValueMessage
}

/**
 * Whether the value exceeds the field's min or max constraints.
 */
export function fieldExceedsBounds(field: Field, inputValue: any): ExceedBoundsResult {
  const { min, max } = field._f

  const ref = field._f.ref as HTMLInputElement

  const maxOutput = parseValidationRule(max)

  const minOutput = parseValidationRule(min)

  // Number comparison

  if (inputValue != null && !isNaN(inputValue)) {
    const valueNumber = ref.valueAsNumber || (inputValue ? +inputValue : inputValue)

    const exceedMax = maxOutput.value != null && valueNumber > maxOutput.value

    const exceedMin = minOutput.value != null && valueNumber < minOutput.value

    return { exceedMax, exceedMin, maxLength: maxOutput, minLength: minOutput }
  }

  // Date comparison. Can be a relative time or week, or absolute date string.

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

  return { exceedMax, exceedMin, maxLength: maxOutput, minLength: minOutput }
}

/**
 * Converts a relative time or week to a date.
 */
export function convertToDate(value: unknown) {
  return new Date(`${new Date().toDateString()} ${value}`)
}
