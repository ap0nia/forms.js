import type { FieldElement } from '../field'

export function isFileInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'file'
}
