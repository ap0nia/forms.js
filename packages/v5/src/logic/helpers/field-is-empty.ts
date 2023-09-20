import type { Field } from '../fields'
import { isFileInput } from '../html/file'
import { isHTMLElement } from '../html/is-html-element'

/**
 * Helper function describing whether a field's ref is empty.
 */
export function fieldIsEmpty(field: Field, inputValue: unknown): boolean {
  const { ref, value, valueAsNumber } = field._f

  if ((valueAsNumber || isFileInput(field._f.ref)) && value == null && inputValue == null) {
    return true
  }

  if ((isHTMLElement(ref) && value === '') || inputValue === '') {
    return true
  }

  return Array.isArray(inputValue) && !inputValue.length
}
