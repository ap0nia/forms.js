import type { CriteriaMode } from '../constants'
import type { Field, FieldRefs, FieldName } from '../field'
import { deepGet } from '../utils/deep-get'
import { deepSet } from '../utils/deep-set'

export function getResolverOptions<T>(
  fieldsNames: Set<string> | string[],
  _fields: FieldRefs,
  criteriaMode?: CriteriaMode,
  shouldUseNativeValidation?: boolean | undefined,
) {
  const fields: Record<string, Field> = {}

  for (const name of fieldsNames) {
    const field: Field = deepGet(_fields, name)

    if (field) {
      deepSet(fields, name, field)
    }
  }

  return {
    criteriaMode,
    names: [...fieldsNames] as FieldName<T>[],
    fields,
    shouldUseNativeValidation,
  }
}
