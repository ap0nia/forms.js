import type { FieldElement } from '../../types/fields'

export function isSingleSelectInput(element: FieldElement): element is HTMLSelectElement {
  return element.type === 'select-one'
}

export function isMultipleSelectInput(element: FieldElement): element is HTMLSelectElement {
  return element.type === 'select-multiple'
}
