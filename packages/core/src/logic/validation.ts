import { INPUT_VALIDATION_RULES } from '../constants'
import { getCheckboxValue, isCheckBoxInput } from '../utils/html/checkbox'
import { isFileInput } from '../utils/html/file'
import { isHTMLElement } from '../utils/html/is-html-element'
import { getRadioValue, isRadioInput } from '../utils/html/radio'
import { isObject } from '../utils/is-object'
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
  value?: T
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

  const { ref, refs, name } = field._f

  const inputValue = safeGet(formValues, name)

  const inputRef = (refs ? refs[0] : ref) as HTMLInputElement

  const shouldSetCustomValidity = shouldUseNativeValidation && inputRef.reportValidity

  const errors: InternalFieldErrors = {}

  if (requiredButMissing(field, inputValue, isFieldArray)) {
    const { value, message } = getValueAndMessage(field._f.required)

    if (value) {
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

      if (!validateAllFieldCriteria && shouldSetCustomValidity) {
        setCustomValidity(inputRef, message)
        return errors
      }
    }
  }

  const isEmpty = refIsEmpty(field, inputValue)

  const { min, max } = field._f

  if (!isEmpty && (min != null || max != null)) {
    let exceedMax
    let exceedMin
    const maxOutput = getValueAndMessage(max)
    const minOutput = getValueAndMessage(min)

    if (inputValue != null && !isNaN(inputValue)) {
      const valueNumber =
        (ref as HTMLInputElement).valueAsNumber || (inputValue ? +inputValue : inputValue)

      if (maxOutput.value != null) {
        exceedMax = valueNumber > maxOutput.value
      }

      if (minOutput.value != null) {
        exceedMin = valueNumber < minOutput.value
      }
    } else {
      const valueDate = (ref as HTMLInputElement).valueAsDate || new Date(inputValue as string)
      const convertTimeToDate = (time: unknown) => new Date(new Date().toDateString() + ' ' + time)
      const isTime = ref.type == 'time'
      const isWeek = ref.type == 'week'

      if (typeof maxOutput.value === 'string' && inputValue) {
        exceedMax = isTime
          ? convertTimeToDate(inputValue) > convertTimeToDate(maxOutput.value)
          : isWeek
          ? inputValue > maxOutput.value
          : valueDate > new Date(maxOutput.value)
      }

      if (typeof minOutput.value === 'string' && inputValue) {
        exceedMin = isTime
          ? convertTimeToDate(inputValue) < convertTimeToDate(minOutput.value)
          : isWeek
          ? inputValue < minOutput.value
          : valueDate < new Date(minOutput.value)
      }
    }

    if (exceedMax || exceedMin) {
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

      if (!validateAllFieldCriteria && shouldSetCustomValidity) {
        setCustomValidity(inputRef, errors[name]?.message)
        return errors
      }
    }
  }

  return errors
}

export function setCustomValidity(inputRef: HTMLInputElement, message?: string | boolean) {
  inputRef.setCustomValidity(typeof message === 'boolean' ? '' : message || '')
  inputRef.reportValidity()
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
  const isEmpty = refIsEmpty(field, inputValue)

  // If it's **not** a radio or checkbox and there's no value, then it's missing.
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

export function getValueAndMessage(validationRule?: ValidationRule): ValidationValueMessage {
  if (typeof validationRule === 'string') {
    return { value: Boolean(validationRule), message: validationRule }
  }

  if (isObject(validationRule) && !(validationRule instanceof RegExp)) {
    return validationRule
  }

  return { value: validationRule, message: '' }
}
