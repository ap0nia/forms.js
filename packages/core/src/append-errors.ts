import type { InternalFieldErrors } from './errors'
import type { ValidateResult } from './validator'

export function appendErrors(
  name: string,
  validateAllFieldCriteria: boolean,
  errors: InternalFieldErrors,
  type: string,
  message: ValidateResult,
) {
  if (!validateAllFieldCriteria) {
    return {}
  }

  return {
    ...errors[name],
    types: {
      ...(errors[name] && errors[name]!.types ? errors[name]!.types : {}),
      [type]: message || true,
    },
  }
}
