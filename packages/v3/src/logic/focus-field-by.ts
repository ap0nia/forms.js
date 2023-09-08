import type { Field, FieldRefs, InternalFieldName } from '../types/fields'
import { isObject } from '../utils/is-object'
import { safeGet } from '../utils/safe-get'

export function focusFieldBy(
  fields: FieldRefs,
  callback: (name?: string) => unknown,
  fieldsNames?: Set<InternalFieldName> | InternalFieldName[],
) {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = safeGet<Field | undefined>(fields, key)

    if (field == null) {
      continue
    }
    const { _f, ...currentField } = field

    if (_f && callback(_f.name)) {
      if (_f.ref.focus) {
        _f.ref.focus()
        break
      } else if (_f.refs && _f.refs[0]?.focus) {
        _f.refs[0].focus()
        break
      }
    } else if (isObject(currentField)) {
      focusFieldBy(currentField, callback)
    }
  }
}
