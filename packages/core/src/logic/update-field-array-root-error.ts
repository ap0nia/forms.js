import { deepSet } from '../utils/deep-set'
import { safeGet } from '../utils/safe-get'

import type { FieldError, FieldErrors } from './errors'

export function updateFieldArrayRootError<T extends Record<string, any> = Record<string, any>>(
  errors: FieldErrors<T>,
  error: Partial<Record<string, FieldError>>,
  name: string,
): FieldErrors<T> {
  const fieldErrors = safeGet(errors, name)

  const fieldErrorsArray = Array.isArray(fieldErrors) ? fieldErrors.filter(Boolean) : []

  deepSet(fieldErrorsArray, 'root', error[name])

  deepSet(errors, name, fieldErrorsArray)

  return errors
}
