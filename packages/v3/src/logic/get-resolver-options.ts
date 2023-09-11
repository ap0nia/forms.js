import type { CriteriaMode } from '../constants'
import type { Field, FieldName, FieldRecord, FieldValues, InternalFieldName } from '../types/fields'
import { deepSet } from '../utils/deep-set'
import { safeGet } from '../utils/safe-get'

export function getResolverOptions<T extends FieldValues>(
  fieldsNames: Set<InternalFieldName> | InternalFieldName[],
  _fields: FieldRecord,
  criteriaMode?: CriteriaMode,
  shouldUseNativeValidation?: boolean | undefined,
) {
  const fields: Record<InternalFieldName, Field['_f']> = {}

  for (const name of fieldsNames) {
    const field = safeGet<Field | undefined>(_fields, name)

    field && deepSet(fields, name, field._f)
  }

  return {
    criteriaMode,
    names: [...fieldsNames] as FieldName<T>[],
    fields,
    shouldUseNativeValidation,
  }
}
