import type { FieldElement } from '../field'

export function isCheckBoxInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'checkbox'
}
