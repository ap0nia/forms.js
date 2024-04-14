import type { FieldElement } from '../types'

export function isRadioInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'radio'
}
