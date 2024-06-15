import type { Field } from '../../types/fields'
import { isFileInput } from '../html/file'
import { isHTMLElement } from '../html/is-html-element'

/**
 * Helper function describing whether a field's ref is empty. Used for validating fields.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/d4e21349f9f5d76f1daeaab9cb8d84c18348efcf/src/logic/validateField.ts#L64
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
