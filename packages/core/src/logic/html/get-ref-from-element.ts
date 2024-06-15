import type { FieldElement } from '../../types/fields'

/**
 * Given an element, get the ref of the element.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/72c4f111c8efc49d488972125dcfbc9c0136cbdb/src/logic/createFormControl.ts#L916
 */
export function getRefFromElement(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
): FieldElement {
  if (element.value != null) {
    return element
  }

  return (element.querySelectorAll?.('input,select,textarea')?.[0] ?? element) as FieldElement
}
