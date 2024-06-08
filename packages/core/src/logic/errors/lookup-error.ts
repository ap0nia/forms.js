import { get } from '@forms.js/common/utils/get'

import type { FieldError, FieldErrors } from '../../types/errors'
import type { FieldRecord } from '../../types/fields'

export type FoundError = {
  error?: FieldError
  name: string
}

/**
 * This primarily handles errors nested in arrays.
 *
 * e.g. It removes the index from the name. 'foo.bar[3]' => 'foo.bar'
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/logic/schemaErrorLookup.ts
 */
export function lookupError<T extends Record<string, any> = Record<string, any>>(
  errors: FieldErrors<T>,
  fields: FieldRecord,
  name: string,
): FoundError {
  const error = get(errors, name)

  if (error || /^\w*$/.test(name)) {
    return { error, name }
  }

  const names = name.split('.')

  while (names.length) {
    const fieldName = names.join('.')
    const field = get(fields, fieldName)
    const foundError = get(errors, fieldName)

    if (field && !Array.isArray(field) && name !== fieldName) {
      return { name }
    }

    if (foundError && foundError.type) {
      return {
        name: fieldName,
        error: foundError,
      }
    }

    names.pop()
  }

  return { name }
}
