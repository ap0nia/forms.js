import type { FieldElement } from '../field'

export function isRadioInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'radio'
}
