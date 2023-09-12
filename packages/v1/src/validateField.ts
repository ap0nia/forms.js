import { appendErrors } from './append-errors'
import { INPUT_VALIDATION_RULES, type InputValidationRules } from './constants'
import type { FieldError, InternalFieldErrors } from './errors'
import type { Field, NativeFieldValue } from './field'
import { getCheckboxValue } from './get-checkbox-value'
import { getRadioValue } from './get-radio-value'
import { getValidateError } from './get-validate-error'
import { getValueAndMessage } from './get-value-and-message'
import { isBoolean } from './guards/is-boolean'
import { isCheckBoxInput } from './guards/is-checkbox-input'
import { isEmptyObject } from './guards/is-empty-object'
import { isFileInput } from './guards/is-file-input'
import { isFunction } from './guards/is-function'
import { isHTMLElement } from './guards/is-html-element'
import { isNullish } from './guards/is-nullish'
import { isObject } from './guards/is-object'
import { isRadioInput } from './guards/is-radio-input'
import { isRegex } from './guards/is-regex'
import type { AnyRecord } from './utils/any-record'
import { deepGet } from './utils/deep-get'
import { isString } from './utils/is-string'

export default async <T extends AnyRecord>(
  field: Field,
  formValues: T,
  validateAllFieldCriteria: boolean,
  shouldUseNativeValidation?: boolean,
  isFieldArray?: boolean,
): Promise<InternalFieldErrors> => {
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
  const inputValue = deepGet<NativeFieldValue>(formValues, name)

  if (!mount || disabled) {
    return {}
  }

  const inputRef = (refs ? refs[0] : ref) as HTMLInputElement

  const setCustomValidity = (message?: string | boolean) => {
    if (shouldUseNativeValidation && inputRef.reportValidity) {
      inputRef.setCustomValidity(isBoolean(message) ? '' : message || '')
      inputRef.reportValidity()
    }
  }

  const error: InternalFieldErrors = {}

  const isRadio = isRadioInput(ref)

  const isCheckBox = isCheckBoxInput(ref)

  const isRadioOrCheckbox = isRadio || isCheckBox

  const isEmpty =
    ((valueAsNumber || isFileInput(ref)) && isNullish(ref.value) && isNullish(inputValue)) ||
    (isHTMLElement(ref) && ref.value === '') ||
    inputValue === '' ||
    (Array.isArray(inputValue) && !inputValue.length)

  const appendErrorsCurry = appendErrors.bind(null, name, validateAllFieldCriteria, error)

  const getMinMaxMessage = (
    exceedMax: boolean,
    maxLengthMessage: string,
    minLengthMessage: string,
    maxType: InputValidationRules['max' | 'maxLength'] = INPUT_VALIDATION_RULES.maxLength,
    minType: InputValidationRules['min' | 'minLength'] = INPUT_VALIDATION_RULES.minLength,
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
        ((!isRadioOrCheckbox && (isEmpty || isNullish(inputValue))) ||
          (isBoolean(inputValue) && !inputValue) ||
          (isCheckBox && !getCheckboxValue(refs).isValid) ||
          (isRadio && !getRadioValue(refs).isValid))
  ) {
    const { value, message } = isString(required)
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

  if (!isEmpty && (!isNullish(min) || !isNullish(max))) {
    let exceedMax
    let exceedMin
    const maxOutput = getValueAndMessage(max)
    const minOutput = getValueAndMessage(min)

    if (!isNullish(inputValue) && !isNaN(inputValue as number)) {
      const valueNumber =
        (ref as HTMLInputElement).valueAsNumber || (inputValue ? +inputValue : inputValue)
      if (!isNullish(maxOutput.value)) {
        exceedMax = valueNumber > maxOutput.value
      }
      if (!isNullish(minOutput.value)) {
        exceedMin = valueNumber < minOutput.value
      }
    } else {
      const valueDate = (ref as HTMLInputElement).valueAsDate || new Date(inputValue as string)
      const convertTimeToDate = (time: unknown) => new Date(new Date().toDateString() + ' ' + time)
      const isTime = ref.type == 'time'
      const isWeek = ref.type == 'week'

      if (isString(maxOutput.value) && inputValue) {
        exceedMax = isTime
          ? convertTimeToDate(inputValue) > convertTimeToDate(maxOutput.value)
          : isWeek
          ? inputValue > maxOutput.value
          : valueDate > new Date(maxOutput.value)
      }

      if (isString(minOutput.value) && inputValue) {
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
    (isString(inputValue) || (isFieldArray && Array.isArray(inputValue)))
  ) {
    const maxLengthOutput = getValueAndMessage(maxLength)
    const minLengthOutput = getValueAndMessage(minLength)
    const exceedMax =
      !isNullish(maxLengthOutput.value) && inputValue.length > +maxLengthOutput.value
    const exceedMin =
      !isNullish(minLengthOutput.value) && inputValue.length < +minLengthOutput.value

    if (exceedMax || exceedMin) {
      getMinMaxMessage(exceedMax, maxLengthOutput.message, minLengthOutput.message)
      if (!validateAllFieldCriteria) {
        setCustomValidity(error[name]!.message)
        return error
      }
    }
  }

  if (pattern && !isEmpty && isString(inputValue)) {
    const { value: patternValue, message } = getValueAndMessage(pattern)

    if (isRegex(patternValue) && !inputValue.match(patternValue)) {
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
    if (isFunction(validate)) {
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
