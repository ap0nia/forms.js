import type { ErrorOption } from '../../types/errors'
import type { FlattenObject } from '../../utils/types/flatten-object'

/**
 * Method to set an error.
 */
export type SetError<T, TFlattened = FlattenObject<T>> = (
  name: keyof TFlattened | 'root' | `root.${string}`,
  error: ErrorOption,
  options?: SetErrorOptions,
) => void

/**
 * Additional options when setting an error.
 */
export type SetErrorOptions = {
  /**
   * Whether to focus on the field that triggered the error.
   */
  shouldFocus?: boolean
}
