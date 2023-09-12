import { getCheckboxValue, isCheckBoxInput } from '../utils/html/checkbox'
import { isFileInput } from '../utils/html/file'
import { isHTMLElement } from '../utils/html/is-html-element'
import { getRadioValue, isRadioInput } from '../utils/html/radio'
import { notNullish } from '../utils/null'
import { safeGet } from '../utils/safe-get'

import type { InternalFieldErrors } from './errors'
import type { Field, FieldRecord } from './fields'

/**
 * Not sure what this is for.
 */
export type ValidationValue = boolean | number | string | RegExp

/**
 * Maybe this is referenced when displaying validation errors?
 */
export type ValidationValueMessage<T = ValidationValue> = {
  value: T
  message: string
}

/**
 * What's a validation rule used for?
 */
export type ValidationRule<T = ValidationValue> = T | ValidationValueMessage<T>

/**
 * Not sure what this is for.
 */
export type ValidateResult = string | string[] | boolean | undefined

/**
 * A validator function.
 */
export type Validate<TFieldValue, TFormValues> = (
  value: TFieldValue,
  formValues: TFormValues,
) => ValidateResult | Promise<ValidateResult>

export type ValidationOptions = {
  exitEarly?: boolean
  shouldDisplayAllAssociatedErrors?: boolean
  shouldUseNativeValidation?: boolean

  /**
   * Callback to determine if a field is a field array root.
   *
   * Should be handled by a parent FormControl.
   */
  isFieldArrayRoot?: (name: string) => boolean

  /**
   * Callback to execute after validation.
   *
   * Should be handled by a parent {@link FormControl}.
   */
  afterValidation?: (name: string, error: InternalFieldErrors, isFieldArrayRoot?: boolean) => void
}

/**
 * Validate a form with native validation constraints.
 */
export async function executeNativeValidation(
  fields: FieldRecord,
  values: any,
  options: ValidationOptions,
): Promise<boolean> {
  let isValid = true

  const definedFields = Object.values(fields).filter(notNullish)

  for (const field of definedFields) {
    const { _f, ...fieldValue } = field

    const isFieldArrayRoot = options.isFieldArrayRoot?.(_f.name)

    const fieldError = await nativelyValidateField(
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
      isValid &&= await executeNativeValidation(fieldValue, values, options)
    }
  }

  return isValid
}

async function nativelyValidateField(
  field: Field,
  formValues: any,
  validateAllFieldCriteria?: boolean,
  shouldUseNativeValidation?: boolean,
  isFieldArray?: boolean,
): Promise<InternalFieldErrors> {
  if (!field._f.mount || field._f.disabled) {
    return {}
  }

  const inputValue = safeGet(formValues, field._f.name)

  const inputRef = (field._f.refs ? field._f.refs[0] : field._f.ref) as HTMLInputElement

  const shouldSetCustomValidity = shouldUseNativeValidation && inputRef.reportValidity

  const errors: InternalFieldErrors = {}

  hasError(field, inputValue, isFieldArray)

  validateAllFieldCriteria

  if (shouldSetCustomValidity) {
    setCustomValidity(inputRef, '')
  }

  return errors
}

export function setCustomValidity(inputRef: HTMLInputElement, message?: string | boolean) {
  inputRef.setCustomValidity(typeof message === 'boolean' ? '' : message || '')
  inputRef.reportValidity()
}

function hasError(field: Field, inputValue: any, isFieldArray?: boolean) {
  if ((isFieldArray && !Array.isArray(inputValue)) || !inputValue.length) {
    return true
  }

  if (!field._f.required) {
    return false
  }

  const isRadio = isRadioInput(field._f.ref)
  const isCheckBox = isCheckBoxInput(field._f.ref)
  const isRadioOrCheckbox = isRadio || isCheckBox
  const isEmpty = refIsEmpty(field, inputValue)

  if (!isRadioOrCheckbox && (isEmpty || inputValue == null)) {
    return true
  }

  if (typeof inputValue === 'boolean' && !inputValue) {
    return true
  }

  if (isCheckBox && !getCheckboxValue(field._f.refs).isValid) {
    return true
  }

  if (isRadio && !getRadioValue(field._f.refs).isValid) {
    return true
  }

  return false
}

function refIsEmpty(field: Field, inputValue: unknown) {
  const { ref, value, valueAsNumber } = field._f

  if ((valueAsNumber || isFileInput(field._f.ref)) && value == null && inputValue == null) {
    return true
  }

  if ((isHTMLElement(ref) && value === '') || inputValue === '') {
    return true
  }

  return Array.isArray(inputValue) && !inputValue.length
}
