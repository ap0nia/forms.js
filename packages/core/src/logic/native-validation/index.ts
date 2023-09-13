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
      options.shouldUseNativeValidation && !options.exitEarly,
      isFieldArrayRoot,
    )

    if (fieldError[_f.name]) {
      if (options.exitEarly) {
        return false
      } else {
        isValid = false
      }
    }

    options.afterValidation?.(_f.name, fieldError, isFieldArrayRoot)

    // if (!options.exitEarly && safeGet(fieldError, _f.name)) {
    //   if (isFieldArrayRoot) {
    //     updateFieldArrayRootError(_formState.errors, fieldError, _f.name)
    //   } else {
    //     set(_formState.errors, _f.name, fieldError[_f.name])
    //   }
    // } else {
    //   unset(_formState.errors, _f.name)
    // }

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

const nativeValidators = [
  nativeValidateRequired,
  nativeValidateMinMax,
  nativeValidateMinMaxLength,
  nativeValidatePattern,
  nativeValidateValidate,
]

const sequencedNativeValidators = nativeValidators.map((nativeValidator, index) => {
  return async (context: NativeValidationContext) => {
    return nativeValidator(context, nativeValidators[index + 1])
  }
})
