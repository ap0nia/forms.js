import { isEmptyObject } from '../../utils/is-object'
import { noop } from '../../utils/noop'
import { notNullish } from '../../utils/null'
import { safeGet } from '../../utils/safe-get'
import type { InternalFieldErrors } from '../errors'
import type { Field, FieldRecord } from '../fields'
import { setCustomValidity } from '../helpers/set-custom-validity'

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

  let errors: InternalFieldErrors = {}

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
