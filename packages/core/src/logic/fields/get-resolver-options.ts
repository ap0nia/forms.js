import { get } from '@forms.js/common/utils/get'
import { set } from '@forms.js/common/utils/set'

import type { CriteriaMode } from '../../constants'
import type { Field, FieldRecord, FieldReference } from '../../types/fields'
import type { ResolverOptions } from '../../types/resolver'

export function getResolverOptions<T extends Record<string, any>>(
  fieldsNames: Set<string> | string[],
  _fields: FieldRecord,
  criteriaMode?: CriteriaMode[keyof CriteriaMode],
  shouldUseNativeValidation?: boolean | undefined,
): ResolverOptions<T> {
  const fields: Record<string, FieldReference> = {}

  for (const name of fieldsNames) {
    const field: Field = get(_fields, name)

    field && set(fields, name, field._f)
  }

  return {
    criteriaMode,
    names: [...fieldsNames] as any,
    fields,
    shouldUseNativeValidation,
  }
}

export default getResolverOptions
