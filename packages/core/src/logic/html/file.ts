import type { FieldElement } from '../../types/fields'

export function isFileInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'file'
}

export function getFileValue(element: HTMLInputElement) {
  return element.files
}
