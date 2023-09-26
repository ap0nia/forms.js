import type { CriteriaMode } from '../../constants'
import type { Field, FieldRecord, FieldReference } from '../../types/fields'
import type { ResolverOptions } from '../../types/resolver'
import { deepSet } from '../../utils/deep-set'
import { safeGet } from '../../utils/safe-get'

export function getResolverOptions<T>(
  fieldsNames: Set<string> | string[],
  _fields: FieldRecord,
  criteriaMode?: CriteriaMode[keyof CriteriaMode],
  shouldUseNativeValidation?: boolean | undefined,
): ResolverOptions<T> {
  const fields: Record<string, FieldReference> = {}

  for (const name of fieldsNames) {
    const field = safeGet<Field | undefined>(_fields, name)

    if (field) {
      deepSet(fields, name, field._f)
    }
  }

  return {
    criteriaMode,
    names: [...fieldsNames] as any,
    fields,
    shouldUseNativeValidation,
  }
}
