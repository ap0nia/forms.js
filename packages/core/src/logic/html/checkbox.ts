import type { FieldElement } from '../../types/fields'

const invalidResult: CheckboxFieldResult = { value: false, isValid: false }

const validResult: CheckboxFieldResult = { value: true, isValid: true }

export type CheckboxFieldResult = {
  isValid: boolean
  value: string | string[] | boolean | undefined
}

export function isCheckBoxInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'checkbox'
}

export function getCheckBoxValue(options?: HTMLInputElement[]): CheckboxFieldResult {
  if (!Array.isArray(options)) {
    return invalidResult
  }

  // Group of options.
  if (options.length > 1) {
    const value = options
      .filter((option) => option && option.checked && !option.disabled)
      .map((option) => option.value)

    return { value, isValid: !!value.length }
  }

  // Single option.
  const option = options[0]

  if (!option?.checked || option.disabled) {
    return invalidResult
  }

  if (!('value' in option.attributes) || option.attributes.value == null) {
    return validResult
  }

  return option.value == null || option.value === ''
    ? validResult
    : { value: option.value, isValid: true }
}
