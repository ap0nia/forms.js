import type { FlattenObject as FlattenFormValues } from '../utils/flatten-object'

/**
 * Helper type to flatten all of a form's nested properties into a single layer fieldname -> value object.
 */
export type { FlattenFormValues }

/**
 * Parses a form into its flattened keys and values.
 *
 * A key is a field name, and can be used to access the flattened values.
 */
export type ParseForm<T, TFlattenedValues extends FlattenFormValues<T> = FlattenFormValues<T>> = {
  values: TFlattenedValues
  keys: Extract<keyof TFlattenedValues, string>
}
