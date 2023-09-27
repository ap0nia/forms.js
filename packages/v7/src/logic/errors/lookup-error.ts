import type { FieldError, FieldErrors } from '../../types/errors'
import type { FieldRecord } from '../../types/fields'
import { safeGet } from '../../utils/safe-get'

export type FoundError = {
  error?: FieldError
  name: string
}

export function lookupError<T>(
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

  return {
    name,
  }
}
