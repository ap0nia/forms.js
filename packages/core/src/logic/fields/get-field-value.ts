import type { FieldReference } from '../../types/fields'
import { getCheckBoxValue, isCheckBoxInput } from '../html/checkbox'
import { isFileInput } from '../html/file'
import { getRadioValue, isRadioInput } from '../html/radio'
import { isMultipleSelectInput } from '../html/select'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/logic/getFieldValue.ts
 */
export function getFieldValue(_f: FieldReference) {
  if (_f.refs ? _f.refs.every((ref) => ref.disabled) : _f.ref.disabled) {
    return
  }

  if (isFileInput(_f.ref)) {
    return _f.ref.files
  }

  if (isRadioInput(_f.ref)) {
    return getRadioValue(_f.refs).value
  }

  if (isMultipleSelectInput(_f.ref)) {
    return [..._f.ref.selectedOptions].map(({ value }) => value)
  }

  if (isCheckBoxInput(_f.ref)) {
    return getCheckBoxValue(_f.refs).value
  }

  return getFieldValueAs(_f.value ?? _f.ref.value, _f)
}

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/logic/getFieldValueAs.ts
 */
export function getFieldValueAs(value: unknown, field: Partial<FieldReference> = {}) {
  const { valueAsNumber, valueAsDate, setValueAs } = field

  const convertedValue = valueAsNumber
    ? valueToNumber(value)
    : valueAsDate && typeof value === 'string'
    ? new Date(value)
    : setValueAs?.(value)

  return convertedValue ?? value
}

export function valueToNumber(value: unknown) {
  if (value === '') {
    return NaN
  }

  return value ? +value : value
}
