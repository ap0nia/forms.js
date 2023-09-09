import { INPUT_VALIDATION_RULES, type InputValidationRules } from '../constants'
import { getCheckboxValue, isCheckBoxInput } from '../lib/html/checkbox'
import { isFileInput } from '../lib/html/file'
import { getRadioValue, isRadioInput } from '../lib/html/radio'
import { isEmptyObject } from '../lib/is-empty-object'
import { isHTMLElement } from '../lib/is-html-element'
import type { FieldError, InternalFieldErrors, Message } from '../types/errors'
import type { Field, FieldValues, InternalFieldName, NativeFieldValue, Ref } from '../types/fields'
import type { ValidateResult, ValidationRule } from '../types/validator'
import { isObject } from '../utils/is-object'
import { safeGet } from '../utils/safe-get'

export function getValueAndMessage(validationData?: ValidationRule) {
  return isObject(validationData) && !(validationData instanceof RegExp)
    ? validationData
    : {
        value: validationData,
        message: '',
      }
}

export async function validateField<T extends FieldValues>(
  field: Field,
  formValues: T,
  validateAllFieldCriteria: boolean,
  shouldUseNativeValidation?: boolean,
  isFieldArray?: boolean,
): Promise<InternalFieldErrors> {
  const {
    ref,
    refs,
    required,
    maxLength,
    minLength,
    min,
    max,
    pattern,
    validate,
    name,
    valueAsNumber,
    mount,
    disabled,
  } = field._f
  const inputValue = safeGet<NativeFieldValue>(formValues, name)

  if (!mount || disabled) {
    return {}
  }

  const inputRef: HTMLInputElement = (refs ? refs[0] : ref) as HTMLInputElement

  const setCustomValidity = (message?: string | boolean) => {
    if (shouldUseNativeValidation && inputRef.reportValidity) {
      inputRef.setCustomValidity(typeof message === 'boolean' ? '' : message || '')
      inputRef.reportValidity()
    }
  }

  const error: InternalFieldErrors = {}

  const isRadio = isRadioInput(ref)

  const isCheckBox = isCheckBoxInput(ref)

  const isRadioOrCheckbox = isRadio || isCheckBox

  const isEmpty =
    ((valueAsNumber || isFileInput(ref)) && ref.value == null && inputValue == null) ||
    (isHTMLElement(ref) && ref.value === '') ||
    inputValue === '' ||
    (Array.isArray(inputValue) && !inputValue.length)

  const appendErrorsCurry = appendErrors.bind(null, name, validateAllFieldCriteria, error)

  const getMinMaxMessage = (
    exceedMax: boolean,
    maxLengthMessage: Message,
    minLengthMessage: Message,
    maxType: InputValidationRules['maxLength' | 'max'] = INPUT_VALIDATION_RULES.maxLength,
    minType: InputValidationRules['minLength' | 'min'] = INPUT_VALIDATION_RULES.minLength,
  ) => {
    const message = exceedMax ? maxLengthMessage : minLengthMessage
    error[name] = {
      type: exceedMax ? maxType : minType,
      message,
      ref,
      ...appendErrorsCurry(exceedMax ? maxType : minType, message),
    }
  }

  if (
    isFieldArray
      ? !Array.isArray(inputValue) || !inputValue.length
      : required &&
        ((!isRadioOrCheckbox && (isEmpty || inputValue == null)) ||
          (typeof inputValue == 'boolean' && !inputValue) ||
          (isCheckBox && !getCheckboxValue(refs).isValid) ||
          (isRadio && !getRadioValue(refs).isValid))
  ) {
    const { value, message } =
      typeof required === 'string'
        ? { value: !!required, message: required }
        : getValueAndMessage(required)

    if (value) {
      error[name] = {
        type: INPUT_VALIDATION_RULES.required,
        message,
        ref: inputRef,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.required, message),
      }
      if (!validateAllFieldCriteria) {
        setCustomValidity(message)
        return error
      }
    }
  }

  if (!isEmpty && (min != null || max != null)) {
    let exceedMax
    let exceedMin
    const maxOutput = getValueAndMessage(max)
    const minOutput = getValueAndMessage(min)

    if (inputValue != null && !isNaN(inputValue as number)) {
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
      getMinMaxMessage(
        !!exceedMax,
        maxOutput.message,
        minOutput.message,
        INPUT_VALIDATION_RULES.max,
        INPUT_VALIDATION_RULES.min,
      )
      if (!validateAllFieldCriteria) {
        setCustomValidity(error[name]!.message)
        return error
      }
    }
  }

  if (
    (maxLength || minLength) &&
    !isEmpty &&
    (typeof inputValue === 'string' || (isFieldArray && Array.isArray(inputValue)))
  ) {
    const maxLengthOutput = getValueAndMessage(maxLength)

    const minLengthOutput = getValueAndMessage(minLength)

    const exceedMax = maxLengthOutput.value != null && inputValue.length > +maxLengthOutput.value

    const exceedMin = minLengthOutput.value != null && inputValue.length < +minLengthOutput.value

    if (exceedMax || exceedMin) {
      getMinMaxMessage(exceedMax, maxLengthOutput.message, minLengthOutput.message)
      if (!validateAllFieldCriteria) {
        setCustomValidity(error[name]!.message)
        return error
      }
    }
  }

  if (pattern && !isEmpty && typeof inputValue === 'string') {
    const { value: patternValue, message } = getValueAndMessage(pattern)

    if (patternValue instanceof RegExp && !inputValue.match(patternValue)) {
      error[name] = {
        type: INPUT_VALIDATION_RULES.pattern,
        message,
        ref,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.pattern, message),
      }
      if (!validateAllFieldCriteria) {
        setCustomValidity(message)
        return error
      }
    }
  }

  if (validate) {
    if (typeof validate === 'function') {
      const result = await validate(inputValue, formValues)
      const validateError = getValidateError(result, inputRef)

      if (validateError) {
        error[name] = {
          ...validateError,
          ...appendErrorsCurry(INPUT_VALIDATION_RULES.validate, validateError.message),
        }
        if (!validateAllFieldCriteria) {
          setCustomValidity(validateError.message)
          return error
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
            ...appendErrorsCurry(key, validateError.message),
          }

          setCustomValidity(validateError.message)

          if (validateAllFieldCriteria) {
            error[name] = validationResult
          }
        }
      }

      if (!isEmptyObject(validationResult)) {
        error[name] = {
          ref: inputRef,
          ...validationResult,
        }
        if (!validateAllFieldCriteria) {
          return error
        }
      }
    }
  }

  setCustomValidity(true)

  return error
}

export function getValidateError(
  result: ValidateResult,
  ref: Ref,
  type = 'validate',
): FieldError | void {
  if (
    typeof result === 'string' ||
    (Array.isArray(result) && result.every((r) => typeof r === 'string')) ||
    (typeof result === 'boolean' && !result)
  ) {
    return {
      type,
      message: typeof result === 'string' ? result : '',
      ref,
    }
  }
}

export function appendErrors(
  name: InternalFieldName,
  validateAllFieldCriteria: boolean,
  errors: InternalFieldErrors,
  type: string,
  message: ValidateResult,
) {
  return validateAllFieldCriteria
    ? {
        ...errors[name],
        types: {
          ...(errors[name] && errors[name]!.types ? errors[name]!.types : {}),
          [type]: message || true,
        },
      }
    : {}
}
