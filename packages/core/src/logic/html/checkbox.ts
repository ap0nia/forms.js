import type { FieldElement } from '../../types/fields'

const defaultResult: CheckboxFieldResult = {
  value: false,
  isValid: false,
}

const validResult = { value: true, isValid: true }

export type CheckboxFieldResult = {
  isValid: boolean
  value: string | string[] | boolean | undefined
}

export function isCheckBoxInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'checkbox'
}

export function getCheckBoxValue(options?: HTMLInputElement[]): CheckboxFieldResult {
  if (!Array.isArray(options)) {
    return defaultResult
  }

  if (options.length > 1) {
    const values = options
      .filter((option) => option && option.checked && !option.disabled)
      .map((option) => option.value)
    return { value: values, isValid: !!values.length }
  }

  return options[0]?.checked && !options[0].disabled
    ? options[0].attributes && (options[0].attributes as any)?.value != null
      ? options[0].value == null || options[0].value === ''
        ? validResult
        : { value: options[0].value, isValid: true }
      : validResult
    : defaultResult
}
