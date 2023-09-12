import { INPUT_VALIDATION_RULES } from '../constants'
import { getCheckboxValue, isCheckBoxInput } from '../utils/html/checkbox'
import { isFileInput } from '../utils/html/file'
import { isHTMLElement } from '../utils/html/is-html-element'
import { getRadioValue, isRadioInput } from '../utils/html/radio'
import { isEmptyObject } from '../utils/is-empty-object'
import { isObject } from '../utils/is-object'
import { notNullish } from '../utils/null'
import { safeGet } from '../utils/safe-get'

import type { FieldError, InternalFieldErrors } from './errors'
import type { Field, FieldElement, FieldRecord } from './fields'

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

      if (!validateAllFieldCriteria) {
        if (shouldSetCustomValidity) {
          setCustomValidity(inputRef, message)
        }
        return errors
      }
    }
  }

  const isEmpty = refIsEmpty(field, inputValue)

  if (!isEmpty && (field._f.min != null || field._f.max != null)) {
    const { exceedMax, exceedMin, maxOutput, minOutput } = fieldExceedsBounds(field, inputValue)

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

      if (!validateAllFieldCriteria) {
        if (shouldSetCustomValidity) {
          setCustomValidity(inputRef, errors[name]?.message)
        }
        return errors
      }
    }
  }

  const hasLength = typeof inputValue === 'string' || (isFieldArray && Array.isArray(inputValue))

  if ((field._f.maxLength || field._f.minLength) && !isEmpty && hasLength) {
    const maxLengthOutput = getValueAndMessage(field._f.maxLength)
    const minLengthOutput = getValueAndMessage(field._f.minLength)
    const exceedMax = maxLengthOutput.value != null && inputValue.length > +maxLengthOutput.value
    const exceedMin = minLengthOutput.value != null && inputValue.length < +minLengthOutput.value

    if (exceedMax || exceedMin) {
      const message = exceedMax ? maxLengthOutput.message : minLengthOutput.message

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
        return errors
      }
    }
  }

  if (field._f.pattern && !isEmpty && typeof inputValue === 'string') {
    const { value, message } = getValueAndMessage(field._f.pattern)

    if (value instanceof RegExp && !inputValue.match(value)) {
      errors[name] = {
        type: INPUT_VALIDATION_RULES.pattern,
        message,
        ref,
        ...(validateAllFieldCriteria && {
          ...errors[name],
          types: {
            ...errors[name]?.types,
            [INPUT_VALIDATION_RULES.pattern]: message || true,
          },
        }),
      }

      if (!validateAllFieldCriteria) {
        if (shouldSetCustomValidity) {
          setCustomValidity(inputRef, message)
        }
        return errors
      }
    }
  }

  const { validate } = field._f

  if (validate) {
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
              [INPUT_VALIDATION_RULES.validate]: validateError.message,
            },
          }),
        }

        if (!validateAllFieldCriteria) {
          if (shouldSetCustomValidity) {
            setCustomValidity(inputRef, validateError.message)
          }
          return errors
        }
      }
    } else if (isObject(validate)) {
      let validationResult = {} as FieldError

      for (const key in validate) {
        if (!isEmptyObject(validationResult) && !validateAllFieldCriteria) {
          break
        }

        const validateError = getValidateError(
          await validate[key]?.(inputValue, formValues),
          inputRef,
          key,
        )

        if (validateError) {
          validationResult = {
            ...validateError,
            ...(validateAllFieldCriteria && {
              ...errors[name],
              types: {
                ...errors[name]?.types,
                [key]: validateError.message,
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
        errors[name] = {
          ref: inputRef,
          ...validationResult,
        }

        if (!validateAllFieldCriteria) {
          return errors
        }
      }
    }
  }

  if (shouldSetCustomValidity) {
    setCustomValidity(inputRef, true)
  }

  return errors
}

function setCustomValidity(inputRef: HTMLInputElement, message?: string | boolean) {
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

function getValueAndMessage(validationRule?: ValidationRule): ValidationValueMessage {
  if (typeof validationRule === 'string') {
    return { value: Boolean(validationRule), message: validationRule }
  }

  if (isObject(validationRule) && !(validationRule instanceof RegExp)) {
    return validationRule
  }

  return { value: validationRule, message: '' }
}

type ExceedBoundsResult = {
  exceedMax: boolean
  exceedMin: boolean
  maxOutput: ValidationValueMessage
  minOutput: ValidationValueMessage
}

function fieldExceedsBounds(field: Field, inputValue: any): ExceedBoundsResult {
  const { min, max, ref } = field._f

  const maxOutput = getValueAndMessage(max)
  const minOutput = getValueAndMessage(min)

  if (inputValue != null && !isNaN(inputValue)) {
    const valueNumber =
      (ref as HTMLInputElement).valueAsNumber || (inputValue ? +inputValue : inputValue)
    const exceedMax = maxOutput.value != null && valueNumber > maxOutput.value

    const exceedMin = minOutput.value != null && valueNumber < minOutput.value

    return { exceedMax, exceedMin, maxOutput, minOutput }
  }

  const valueDate = (ref as HTMLInputElement).valueAsDate || new Date(inputValue as string)
  const isTime = ref.type == 'time'
  const isWeek = ref.type == 'week'

  const exceedMax =
    typeof maxOutput.value === 'string' &&
    inputValue &&
    (isTime
      ? convertTimeToDate(inputValue) > convertTimeToDate(maxOutput.value)
      : isWeek
      ? inputValue > maxOutput.value
      : valueDate > new Date(maxOutput.value))

  const exceedMin =
    typeof minOutput.value === 'string' &&
    inputValue &&
    (isTime
      ? convertTimeToDate(inputValue) < convertTimeToDate(minOutput.value)
      : isWeek
      ? inputValue < minOutput.value
      : valueDate < new Date(minOutput.value))

  return { exceedMax, exceedMin, maxOutput, minOutput }
}

function convertTimeToDate(time: unknown) {
  return new Date(new Date().toDateString() + ' ' + time)
}

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
