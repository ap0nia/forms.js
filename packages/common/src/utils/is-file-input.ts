import type { FieldElement } from '../types'

export function isFileInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'file'
}
