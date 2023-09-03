import type { FieldError, FieldErrors } from './errors'
import type { AnyRecord } from './utils/any-record'
import { deepGet } from './utils/deep-get'
import { deepSet } from './utils/deep-set'
import { notNullArray } from './utils/not-null-array'

export function updateFieldArrayRootError<T extends AnyRecord = AnyRecord>(
  errors: FieldErrors<T>,
  error: Partial<Record<string, FieldError>>,
  name: string,
): FieldErrors<T> {
  const fieldArrayErrors = notNullArray(deepGet(errors, name))
  deepSet(fieldArrayErrors, 'root', error[name])
  deepSet(errors, name, fieldArrayErrors)
  return errors
}
