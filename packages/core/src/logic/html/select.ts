import type { FieldElement } from '../../types/fields'

export function isSingleSelectInput(element: FieldElement): element is HTMLSelectElement {
  return element.type === 'select-one'
}

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/isMultipleSelect.ts
 */
export function isMultipleSelectInput(element: FieldElement): element is HTMLSelectElement {
  return element.type === 'select-multiple'
}
