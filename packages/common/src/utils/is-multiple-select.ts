import type { FieldElement } from '../types'

export function isMultipleSelect(element: FieldElement): element is HTMLSelectElement {
  return element.type === `select-multiple`
}
