import type { FieldElement } from '../fields'

export function isFileInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'file'
}

export function getFileValue(element: HTMLInputElement) {
  return element.files
}
