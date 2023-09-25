import type { FieldElement } from '../../types/fields'

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

export function getRadioValue(options?: HTMLInputElement[]): RadioFieldResult {
  return Array.isArray(options)
    ? options.reduce(
        (previous, option): RadioFieldResult =>
          option && option.checked && !option.disabled
            ? {
                isValid: true,
                value: option.value,
              }
            : previous,
        defaultReturn,
      )
    : defaultReturn
}
