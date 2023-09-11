import { isCheckBoxInput } from '../lib/html/checkbox'
import { isFileInput } from '../lib/html/file'
import { isMultipleSelectInput } from '../lib/html/select'
import type { Field } from '../types/fields'

import { updateCheckboxElements } from './update-checkbox-elements'

export function updateFieldReference(reference: Field['_f'], value: any) {
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
