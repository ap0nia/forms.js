import { notNullish } from '../../utils/null'
import { safeGet } from '../../utils/safe-get'
import type { InternalFieldErrors } from '../errors'
import type { Field, FieldRecord } from '../fields'
import type { ValidationOptions } from '../validation'

import { nativeValidateMinMax } from './min-max'
import { nativeValidateMinMaxLength } from './min-max-length'
import { nativeValidatePattern } from './pattern'
import { nativeValidateRequired } from './required'
import type { NativeValidationContext } from './types'
import { nativeValidateValidate } from './validate'

/**
 * Native validators receive a context object with all the information they need to validate a field.
 *
 * TODO: allow custom native-validators to be added or to override the default ones.
 *
 * Native-validators __can__ mutate the context object, notably the errors, similar to Express.js middleware.
 */
const nativeValidators = [
  nativeValidateRequired,
  nativeValidateMinMax,
  nativeValidateMinMaxLength,
  nativeValidatePattern,
  nativeValidateValidate,
]

/**
 * Validators receive a "next" function, which should be the next validator in the sequence.
 */
const sequencedNativeValidators = nativeValidators.map((nativeValidator, i) => {
  return (context: NativeValidationContext) => nativeValidator(context, nativeValidators[i + 1])
})

/**
 * Validates all the fields provided.
 */
export async function nativeValidateManyFields(
  fields: FieldRecord,
  values: any,
  options: ValidationOptions,
): Promise<boolean> {
  let isValid = true

  const definedFields = Object.values(fields).filter(notNullish)

  for (const field of definedFields) {
    const { _f, ...fieldValue } = field

    const isFieldArrayRoot = options.isFieldArrayRoot?.(_f.name)

    const fieldError = await nativeValidateSingleField(
      field,
      values,
      options.shouldDisplayAllAssociatedErrors,
      options.shouldUseNativeValidation && !options.validateAllFieldCriteria,
      isFieldArrayRoot,
    )

    if (fieldError[_f.name]) {
      if (options.validateAllFieldCriteria) {
        return false
      } else {
        isValid = false
      }
    }

    options.afterValidation?.(_f.name, fieldError, isFieldArrayRoot)

    if (fieldValue) {
      isValid &&= await nativeValidateManyFields(fieldValue, values, options)
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

  for (const nativeValidator of sequencedNativeValidators) {
    await nativeValidator(context)
  }

  return errors
}
