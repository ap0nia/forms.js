import type { FieldElement } from '../types'

export function isCheckboxInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'checkbox'
}
