import type { CriteriaMode } from '../../constants'
import { deepSet } from '../../utils/deep-set'
import { safeGet } from '../../utils/safe-get'
import type { Field, FieldRecord, FieldReference } from '../fields'
import type { ResolverOptions } from '../resolver'

export function getResolverOptions<T>(
  fieldsNames: Set<string> | string[],
  _fields: FieldRecord,
  criteriaMode?: CriteriaMode,
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
