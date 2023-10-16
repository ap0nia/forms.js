import { isObject } from '@forms.js/common/utils/is-object'
import { safeGet } from '@forms.js/common/utils/safe-get'

import type { Field, FieldRecord } from '../../types/fields'

export function focusFieldBy(
  fields: FieldRecord,
  callback: (name?: string) => unknown,
  fieldNames?: Set<string> | string[],
): void {
  for (const key of fieldNames || Object.keys(fields)) {
    const field = safeGet<Field | undefined>(fields, key)

    if (field == null) {
      continue
    }

    const { _f, ...nestedField } = field

    if (_f && callback(_f.name)) {
      if (_f.ref.focus) {
        _f.ref.focus()
        break
      }
      if (_f.refs?.[0]?.focus) {
        _f.refs[0].focus()
        break
      }
    } else if (isObject(nestedField)) {
      focusFieldBy(nestedField, callback)
    }
  }
}
