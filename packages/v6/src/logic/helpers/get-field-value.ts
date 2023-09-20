import type { FieldReference } from '../fields'
import { getCheckBoxValue, isCheckBoxInput } from '../html/checkbox'
import { isFileInput } from '../html/file'
import { getRadioValue, isRadioInput } from '../html/radio'
import { isMultipleSelectInput } from '../html/select'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/logic/getFieldValue.ts
 */
export function getFieldValue(_f: FieldReference) {
  const ref = _f.ref

  if (_f.refs ? _f.refs.every((ref) => ref.disabled) : ref.disabled) {
    return
  }

  if (isFileInput(ref)) {
    return ref.files
  }

  if (isRadioInput(ref)) {
    return getRadioValue(_f.refs).value
  }

  if (isMultipleSelectInput(ref)) {
    return [...ref.selectedOptions].map(({ value }) => value)
  }

  if (isCheckBoxInput(ref)) {
    return getCheckBoxValue(_f.refs).value
  }

  return getFieldValueAs(ref.value == null ? _f.ref.value : ref.value, _f)
}

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/logic/getFieldValueAs.ts
 */
export function getFieldValueAs(value: unknown, _f: FieldReference) {
  const { valueAsNumber, valueAsDate, setValueAs } = _f

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
