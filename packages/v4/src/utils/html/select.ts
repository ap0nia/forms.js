import type { FieldElement } from '../../logic/fields'

export function isSingleSelectInput(element: FieldElement): element is HTMLSelectElement {
  return element.type === 'select-one'
}

export function isMultipleSelectInput(element: FieldElement): element is HTMLSelectElement {
  return element.type === 'select-multiple'
}
