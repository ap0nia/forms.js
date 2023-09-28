import type { Field, FieldRecord, FieldReference } from '../../types/fields'
import { deepSet } from '../../utils/deep-set'
import { safeGet } from '../../utils/safe-get'

/**
 * Deeply filters fields and extracts their reference (`_f` property).
 */
export function filterFields(names: string[], fields: FieldRecord): Record<string, FieldReference> {
  const filteredFields: Record<string, FieldReference> = {}

  for (const name of names) {
    const field = safeGet<Field | undefined>(fields, name)

    if (field?._f) {
      deepSet(fields, name, field._f)
    }
  }

  return filteredFields
}
