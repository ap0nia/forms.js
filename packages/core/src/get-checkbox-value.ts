import { isNullish } from './guards/is-nullish'

type CheckboxFieldResult = {
  isValid: boolean
  value: string | string[] | boolean | undefined
}

const defaultResult: CheckboxFieldResult = {
  value: false,
  isValid: false,
}

const validResult = { value: true, isValid: true }

export function getCheckboxValue(options?: HTMLInputElement[]): CheckboxFieldResult {
  if (Array.isArray(options)) {
    if (options.length > 1) {
      const values = options
        .filter((option) => option && option.checked && !option.disabled)
        .map((option) => option.value)
      return { value: values, isValid: !!values.length }
    }

    return options[0]?.checked && !options[0]?.disabled
      ? options[0].attributes && !isNullish(options[0].attributes.value)
        ? isNullish(options[0].value) || options[0].value === ''
          ? validResult
          : { value: options[0].value, isValid: true }
        : validResult
      : defaultResult
  }

  return defaultResult
}
