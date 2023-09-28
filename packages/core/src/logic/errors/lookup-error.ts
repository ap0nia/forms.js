import type { FieldError, FieldErrors } from '../../types/errors'
import type { FieldRecord } from '../../types/fields'
import { safeGet } from '../../utils/safe-get'

export type FoundError = {
  error?: FieldError
  name: string
}

/**
 * This primarily handles errors nested in arrays.
 *
 * e.g. It removes the index from the name. 'foo.bar[3]' => 'foo.bar'
 */
export function lookupError<T = Record<string, any>>(
  errors: FieldErrors<T>,
  fields: FieldRecord,
  name: string,
): FoundError {
  const error = safeGet(errors, name)

  if (error || /^\w*$/.test(name)) {
    return { error, name }
  }

  const names = name.split('.')

  while (names.length) {
    const fieldName = names.join('.')
    const field = safeGet(fields, fieldName)
    const foundError = safeGet(errors, fieldName)

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
