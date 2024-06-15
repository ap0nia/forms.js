import type { FieldElement } from '../../types/fields'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isHTMLElement.ts
 */
export function isFileInput(element: FieldElement): element is HTMLInputElement {
  return element.type === 'file'
}

export function getFileValue(element: HTMLInputElement) {
  return element.files
}
