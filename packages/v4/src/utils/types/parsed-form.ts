import type { FlattenObject } from './flatten-object'

/**
 * A form's values are structured as an object.
 * In order to deeply reference a value, a dot-concatenated string path is used.
 *
 * This is also translated to type definitions.
 */
export type ParsedForm<T extends Record<string, any> = Record<string, any>> = {
  /**
   * The flattened form values.
   */
  flattened: FlattenObject<T>

  /**
   * Keys to access the flattened form values.
   */
  keys: keyof FlattenObject<T>
}
