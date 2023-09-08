import { getCheckboxValue, isCheckBoxInput } from '../lib/html/checkbox'
import { getFileValue, isFileInput } from '../lib/html/file'
import { getRadioValue, isRadioInput } from '../lib/html/radio'
import { isMultipleSelectInput } from '../lib/html/select'
import type { Field, NativeFieldValue } from '../types/fields'

export function getFieldValueAs<T extends NativeFieldValue>(value: T, field: Field['_f']) {
  const { valueAsNumber, valueAsDate, setValueAs } = field

  return value == null
    ? value
    : valueAsNumber
    ? value === ''
      ? NaN
      : value
      ? +value
      : value
    : valueAsDate && typeof value === 'string'
    ? new Date(value)
    : setValueAs
    ? setValueAs(value)
    : value
}

export default function getFieldValue(_f: Field['_f']) {
  const ref = _f.ref

  if (_f.refs ? _f.refs.every((ref) => ref.disabled) : ref.disabled) {
    return
  }

  if (isFileInput(ref)) {
    return getFileValue(ref)
  }

  if (isRadioInput(ref)) {
    return getRadioValue(_f.refs).value
  }

  if (isMultipleSelectInput(ref)) {
    return [...ref.selectedOptions].map(({ value }) => value)
  }

  if (isCheckBoxInput(ref)) {
    return getCheckboxValue(_f.refs).value
  }

  return getFieldValueAs(ref.value == null ? _f.ref.value : ref.value, _f)
}
