import type { FieldElement } from '../../types/fields'

/**
 * Given an element, get the ref of the element.
 */
export function getRefFromElement(element: HTMLInputElement): FieldElement {
  if (element.value != null) {
    return element
  }

  return (element.querySelectorAll?.('input,select,textarea')?.[0] ?? element) as FieldElement
}
