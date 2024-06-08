import { get } from '@forms.js/common/utils/get'
import { isEmptyObject } from '@forms.js/common/utils/is-empty-object'
import { noop } from '@forms.js/common/utils/noop'
import { notNullish } from '@forms.js/common/utils/null'

import type { FieldErrorRecord } from '../../../types/errors'
import type { Field, FieldRecord } from '../../../types/fields'
import { setCustomValidity } from '../../html/set-custom-validity'
import { appendErrors } from '../append-errors'

import { nativeValidateMinMax } from './min-max'
import { nativeValidateMinMaxLength } from './min-max-length'
import { nativeValidatePattern } from './pattern'
import { nativeValidateRequired } from './required'
import type {
  NativeValidationContext,
  NativeValidationFunction,
  NativeValidationResult,
} from './types'
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

export type ValidationOptions = {
  /**
   * Whether to exit immediately upon encountering the first error for a single field.
   */
  shouldDisplayAllAssociatedErrors?: boolean

  /**
   * Whether to set the custom validity on the input element.
   *
   * i.e. Using the {@link HTMLInputElement.setCustomValidity} API.
   */
  shouldUseNativeValidation?: boolean

  /**
   * Whether to stop validating fields after the first invalid field is found.
   */
  shouldOnlyCheckValid?: boolean

  /**
   * Callback to determine if a field is a field array root.
   *
   * Should be handled by a parent FormControl.
   */
  isFieldArrayRoot?: (name: string) => boolean
}

/**
 * Natively validates all the provided fields.
 */
export async function nativeValidateFields(
  fields: FieldRecord,
  values: any,
  options?: ValidationOptions,
): Promise<NativeValidationResult> {
  let valid = true

  let errors: FieldErrorRecord = {}

  const names: string[] = []

  const definedFields = Object.values(fields).filter(notNullish)

  for (const field of definedFields) {
    const { _f, ...nestedField } = field

    if (_f != null) {
      const isFieldArrayRoot = options?.isFieldArrayRoot?.(_f.name)

      const fieldValidationResult = await nativeValidateSingleField(
        field,
        values,
        options?.shouldDisplayAllAssociatedErrors,
        options?.shouldUseNativeValidation && !options?.shouldOnlyCheckValid,
        isFieldArrayRoot,
      )

      if (fieldValidationResult[_f.name]) {
        valid = false

        if (options?.shouldOnlyCheckValid) {
          return { names, errors, valid }
        }
      }

      if (!options?.shouldOnlyCheckValid) {
        names.push(_f.name)
        errors = { ...errors, ...fieldValidationResult }
      }
    }

    if (isEmptyObject(nestedField)) {
      continue
    }

    const subResult = await nativeValidateFields(nestedField, values, options)

    valid &&= subResult.valid
    errors = { ...errors, ...subResult.errors }
    names.push(...subResult.names)
  }

  return { names, errors, valid }
}

export async function nativeValidateSingleField(
  field: Field,
  formValues: any,
  validateAllFieldCriteria: boolean = false,
  shouldUseNativeValidation?: boolean,
  isFieldArray?: boolean,
): Promise<FieldErrorRecord> {
  if (!field._f.mount || field._f.disabled) {
    return {}
  }

  const errors: FieldErrorRecord = {}

  const inputRef = (field._f.refs ? field._f.refs[0] : field._f.ref) as HTMLInputElement

  const inputValue = get(formValues, field._f.name)

  const shouldSetCustomValidity = Boolean(shouldUseNativeValidation && inputRef.reportValidity)

  const appendErrorsCurry = appendErrors.bind(null, field._f.name, validateAllFieldCriteria, errors)

  const context: NativeValidationContext = {
    field,
    formValues,
    inputRef,
    inputValue,
    validateAllFieldCriteria,
    shouldSetCustomValidity,
    isFieldArray,
    errors,
    appendErrorsCurry,
  }

  /**
   * TODO: allow customizing the native validators used for a specific field.
   */
  const nativeValidatorSequencer = createNativeValidatorSequencer(defaultNativeValidators)

  /**
   * TODO: maybe allow customizing the next function.
   */
  const next = noop

  const result = nativeValidatorSequencer(context, next)

  // Promises are lazily created, so only await if needed.

  if (result instanceof Promise) {
    await result
  }

  const isValid = !errors[field._f.name]

  if (shouldSetCustomValidity && isValid) {
    setCustomValidity(inputRef, true)
  }

  return errors
}

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

export default nativeValidateSingleField
