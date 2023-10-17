import type { FlattenObject } from '../utils/flatten-object'
// import type { NestedObjectArrays } from '../utils/nested-object-arrays'

/**
 * Parses a form's values into relevant components.
 */
export type ParseForm<
  T,
  TFlattened extends FlattenObject<T> = FlattenObject<T>,
  // TFlattenedFieldArrays extends NestedObjectArrays<TFlattened> = NestedObjectArrays<TFlattened>,
> = {
  /**
   * A flattened representation of the form values.
   */
  values: TFlattened

  /**
   * Keys of the flattened form values. Coerced to string for ease of use.
   *
   * They're dot-concatenated properties and are valid HTML field names.
   */
  keys: Extract<keyof TFlattened, string>

  /**
   * The flattened form where the value is an array of objects.
   */
  // fieldArrays: TFlattenedFieldArrays

  // /**
  //  * Keys of the flattened form values that are mapped to an array of objects.
  //  */
  // fieldArrayKeys: Extract<keyof TFlattenedFieldArrays, string>
}
