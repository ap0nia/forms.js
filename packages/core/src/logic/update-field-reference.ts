import { isCheckBoxInput } from '../utils/html/checkbox'
import { isFileInput } from '../utils/html/file'
import { isMultipleSelectInput } from '../utils/html/select'

import type { FieldReference } from './fields'

export function updateFieldReference(reference: FieldReference, value: any) {
  if (isMultipleSelectInput(reference.ref)) {
    Array.from(reference.ref.options).forEach((option) => {
      option.selected = value.includes(option.value)
    })
    return 'select'
  }

  if (reference.refs && isCheckBoxInput(reference.ref)) {
    updateCheckboxElements(reference.refs, value)
    return 'checkbox'
  }

  if (reference.refs) {
    reference.refs.forEach((radio) => {
      radio.checked = radio.value === value
    })
    return 'radio'
  }

  if (isMultipleSelectInput(reference.ref)) {
    Array.from(reference.ref.options).forEach((option) => {
      option.selected = value.includes(option.value)
    })
    return 'select'
  }

  if (isFileInput(reference.ref)) {
    reference.ref.value = ''
    return 'file'
  }

  reference.ref.value = value

  return 'custom'
}

export function updateCheckboxElements(checkboxes: HTMLInputElement[], value: string | string[]) {
  if (checkboxes.length === 0) {
    return
  }

  if (checkboxes.length === 1 && checkboxes[0]) {
    checkboxes[0].checked = Boolean(value)
    return
  }

  checkboxes
    .filter((checkbox) => !checkbox.defaultChecked || !checkbox.disabled)
    .forEach((checkbox) => {
      checkbox.checked = Array.isArray(value)
        ? value.find((data) => data === checkbox.value) != null
        : value === checkbox.value
    })
}
