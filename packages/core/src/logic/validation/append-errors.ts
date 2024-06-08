import type { FieldErrorRecord } from '../../types/errors'
import type { ValidateResult } from '../../types/validation'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/1d0503b46cfe0589b188c4c0d9fa75f247271cf7/src/logic/appendErrors.ts
 */
export function appendErrors(
  name: string,
  validateAllFieldCriteria: boolean,
  errors: FieldErrorRecord,
  type: string,
  message: ValidateResult,
) {
  if (!validateAllFieldCriteria) return {}

  return {
    ...errors[name],
    types: {
      ...(errors[name] && errors[name]!.types ? errors[name]!.types : {}),
      [type]: message || true,
    },
  }
}
