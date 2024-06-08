import type { FieldErrorRecord } from '../../types/errors'
import type { ValidateResult } from '../../types/validation'

/**
 * This function is not currently used in favor of merging errors explictily...
 *
 * To be integrated, it should be added to {@type NativeValidationContext} and passed to validation middleware.
 *
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

export default appendErrors
