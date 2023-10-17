import type { NestedObjectArrays as FlattenFormValues } from '../utils/nested-object-arrays'

/**
 * Helper type to filter the field names of a form for only ones that are.
 *
 * Field names are dot-concatenated properties and are valid HTML field names.
 */
export type FieldArrayFieldNames<T> = Extract<keyof FlattenFormValues<T>, string>

/**
 * Helper type to flatten all of a form's nested properties into a single layer fieldname -> value object.
 */
export type { FlattenFormValues }

/**
 * Parses a form into its flattened keys and values
 *
 * A key is a field name, and can be used to access the flattened values.
 */
export type ParseForm<T, TFlattenedValues extends FlattenFormValues<T> = FlattenFormValues<T>> = {
  values: TFlattenedValues
  keys: Extract<keyof TFlattenedValues, string>
}
