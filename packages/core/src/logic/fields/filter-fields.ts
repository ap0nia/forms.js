import { deepSet } from '@forms.js/common/utils/deep-set'
import { safeGet } from '@forms.js/common/utils/safe-get'

import type { Field, FieldRecord, FieldReference } from '../../types/fields'

/**
 * Deeply filters fields and extracts their reference (`_f` property).
 */
export function filterFields(names: string[], fields: FieldRecord): Record<string, FieldReference> {
  const filteredFields: Record<string, FieldReference> = {}

  for (const name of names) {
    const field = safeGet<Field | undefined>(fields, name)

    if (field?._f) {
      deepSet(filteredFields, name, field._f)
    }
  }

  return filteredFields
}
