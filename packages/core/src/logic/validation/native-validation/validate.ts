import { isEmptyObject } from '@forms.js/common/utils/is-empty-object'
import { isObject } from '@forms.js/common/utils/is-object'

import { INPUT_VALIDATION_RULE } from '../../../constants'
import type { FieldError } from '../../../types/errors'
import type { FieldElement } from '../../../types/fields'
import type { ValidateResult } from '../../../types/validation'
import { setCustomValidity } from '../../html/set-custom-validity'

import type { NativeValidationFunction } from './types'

/**
 * @returns Promise if validation is needed, otherwise synchronous noop.
 */
export const nativeValidateValidate: NativeValidationFunction = (context, next) => {
  const { validate } = context.field._f

  // Nothing to validate.

  if (validate == null || (typeof validate !== 'function' && !isObject(validate))) {
    return next?.(context)
  }

  return asyncNativeValidateValidate(context, next)
}

/**
 * Converts a {@link ValidateResult} to a {@link FieldError}.
 */
export function getValidateError(
  result: ValidateResult,
  ref: FieldElement,
  type = 'validate',
): FieldError | void {
  if (
    typeof result === 'string' ||
    (Array.isArray(result) && result.every((r) => typeof r === 'string')) ||
    result === false
  ) {
    return {
      type,
      message: typeof result === 'string' ? result : '',
      ref,
    }
  }
}

/**
 * This should only be run after confirming that `validate` exists.
 */
export const asyncNativeValidateValidate: NativeValidationFunction = async (context, next) => {
  const {
    field,
    errors,
    inputRef,
    inputValue,
    formValues,
    validateAllFieldCriteria,
    shouldSetCustomValidity,
  } = context

  const { name, validate } = field._f

  // No need for null check...

  // Validation function.
  if (typeof validate === 'function') {
    const result = await validate(inputValue, formValues)

    const validateError = getValidateError(result, inputRef)

    if (validateError) {
      errors[name] = {
        ...validateError,
        ...(validateAllFieldCriteria && {
          ...errors[name],
          types: {
            ...errors[name]?.types,
            [INPUT_VALIDATION_RULE.validate]: validateError.message || true,
          },
        }),
      }

      if (!validateAllFieldCriteria) {
        if (shouldSetCustomValidity) {
          setCustomValidity(inputRef, validateError.message)
        }
        return
      }
    }

    return next?.(context)
  }

  // Validation record that maps field names to validation functions.

  let validationResult = {} as FieldError

  for (const key in field._f.validate) {
    const currentValidateResult = await validate?.[key]?.(inputValue, formValues)

    const validateError = getValidateError(currentValidateResult, inputRef, key)

    if (validateError) {
      validationResult = {
        ...validateError,
        ...(validateAllFieldCriteria && {
          ...errors[name],
          types: {
            ...errors[name]?.types,
            [key]: validateError.message || true,
          },
        }),
      }

      if (shouldSetCustomValidity) {
        setCustomValidity(inputRef, validateError.message)
      }

      if (validateAllFieldCriteria) {
        errors[name] = validationResult
      }
    }
  }

  if (!isEmptyObject(validationResult)) {
    errors[name] = { ref: inputRef, ...validationResult }

    if (!validateAllFieldCriteria) {
      return
    }
  }

  return next?.(context)
}
