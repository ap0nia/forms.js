import type { FieldElement } from '../../types/fields'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isRadioInput.ts
 */
export function isRadioInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'radio'
}

export type RadioFieldResult = {
  isValid: boolean
  value: number | string | null
}

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: null,
}

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/logic/getRadioValue.ts
 */
export function getRadioValue(options?: HTMLInputElement[]): RadioFieldResult {
  const defaultReturnCopy = { ...defaultReturn }

  if (!Array.isArray(options)) {
    return defaultReturnCopy
  }

  return options.reduce((previous, option): RadioFieldResult => {
    return option?.checked && !option.disabled ? { isValid: true, value: option.value } : previous
  }, defaultReturnCopy)
}
