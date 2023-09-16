import { noop } from '../../utils/noop'
import { notNullish } from '../../utils/null'
import { safeGet } from '../../utils/safe-get'
import type { InternalFieldErrors } from '../errors'
import type { Field, FieldRecord } from '../fields'
import { setCustomValidity } from '../set-custom-validity'
import type { ValidationOptions } from '../validation'

import { nativeValidateMinMax } from './min-max'
import { nativeValidateMinMaxLength } from './min-max-length'
import { nativeValidatePattern } from './pattern'
import { nativeValidateRequired } from './required'
import type { NativeValidationContext, NativeValidationFunction } from './types'
import { nativeValidateValidate } from './validate'

/**
 * Native validators receive a context object with all the information they need to validate a field.
 *
 * TODO: allow custom native-validators to be added or to override the default ones.
 *
 * Native-validators __can__ mutate the context object, notably the errors, similar to Express.js middleware.
 */
const defaultNativeValidators = [
  nativeValidateRequired,
  nativeValidateMinMax,
  nativeValidateMinMaxLength,
  nativeValidatePattern,
  nativeValidateValidate,
]

/**
 * Given an array of native validation functions,
 * returns a single native validation function that runs them in sequence.
 */
function createNativeValidatorSequencer(
  nativeValidators: NativeValidationFunction[],
): NativeValidationFunction {
  const nativeValidatorSequencer: NativeValidationFunction = (context, next) => {
    const runValidatorIndex = (index: number): ReturnType<NativeValidationFunction> => {
      return index < nativeValidators.length
        ? nativeValidators[index]?.(context, () => runValidatorIndex(index + 1))
        : next?.(context)
    }
    return runValidatorIndex(0)
  }
  return nativeValidatorSequencer
}

/**
 * Natively validates all the provided fields.
 */
export async function fieldsAreNativelyValid(
  fields: FieldRecord,
  values: any,
  options?: ValidationOptions,
): Promise<boolean> {
  let isValid = true

  const definedFields = Object.values(fields).filter(notNullish)

  for (const field of definedFields) {
    const { _f, ...fieldValue } = field

    const isFieldArrayRoot = options?.isFieldArrayRoot?.(_f.name)

    const fieldError = await nativeValidateSingleField(
      field,
      values,
      options?.shouldDisplayAllAssociatedErrors,
      options?.shouldUseNativeValidation && !options?.validateAllFieldCriteria,
      isFieldArrayRoot,
    )

    if (fieldError[_f.name]) {
      if (options?.validateAllFieldCriteria) {
        return false
      } else {
        isValid = false
      }
    }

    options?.afterValidation?.(field, fieldError, isFieldArrayRoot)

    if (fieldValue) {
      isValid &&= await fieldsAreNativelyValid(fieldValue, values, options)
    }
  }

  return isValid
}

export async function nativeValidateSingleField(
  field: Field,
  formValues: any,
  validateAllFieldCriteria?: boolean,
  shouldUseNativeValidation?: boolean,
  isFieldArray?: boolean,
): Promise<InternalFieldErrors> {
  if (!field._f.mount || field._f.disabled) {
    return {}
  }

  const errors: InternalFieldErrors = {}

  const inputRef = (field._f.refs ? field._f.refs[0] : field._f.ref) as HTMLInputElement

  const inputValue = safeGet(formValues, field._f.name)

  const shouldSetCustomValidity = Boolean(shouldUseNativeValidation && inputRef.reportValidity)

  const context: NativeValidationContext = {
    field,
    formValues,
    inputRef,
    inputValue,
    validateAllFieldCriteria,
    shouldSetCustomValidity,
    isFieldArray,
    errors,
  }

  /**
   * TODO: allow customizing the native validators used for a specific field.
   */
  const nativeValidatorSequencer = createNativeValidatorSequencer(defaultNativeValidators)

  /**
   * TODO: maybe allow customizing the next function.
   */
  const next = noop

  await nativeValidatorSequencer(context, next)

  if (shouldSetCustomValidity) {
    setCustomValidity(inputRef, true)
  }

  return errors
}
