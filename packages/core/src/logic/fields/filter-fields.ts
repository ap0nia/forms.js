import { get } from '@forms.js/common/utils/get'
import { set } from '@forms.js/common/utils/set'

import type { Field, FieldRecord, FieldReference } from '../../types/fields'

import type { getResolverOptions } from './get-resolver-options'

/**
 * Deeply filters fields and extracts their reference (`_f` property).
 *
 * This function is preferred over {@link getResolverOptions} because it is solely responsible
 * for filtering out relevant fields. It does not transform any existing resolver options,
 * and leaves the responsibility of constructing that object to the parent scope.
 */
export function filterFields(
  names: Set<string> | string[],
  fields: FieldRecord,
): Record<string, FieldReference> {
  const filteredFields: Record<string, FieldReference> = {}

  for (const name of names) {
    const field: Field = get(fields, name)

    if (field?._f) {
      set(filteredFields, name, field._f)
    }
  }

  return filteredFields
}
