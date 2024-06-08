import type { NestedObjectArrays } from '../utils/nested-object-arrays'

import type { ParseForm, FlattenFormValues } from './parse'

/**
 * Helper type to filter the field names of a form for only ones that are.
 * This takes in the raw field values and flattens them before filtering.
 *
 * Field names are dot-concatenated properties and are valid HTML field names.
 */
export type FieldArrayFieldNames<
  T,
  TFlattenedValues extends FlattenFormValues<T> = FlattenFormValues<T>,
> = Extract<keyof NestedObjectArrays<TFlattenedValues>, string>

/**
 * Parses a form into its flattened keys and values and filters by field values.
 *
 * Takes raw field values and flattens them before filtering.
 */
export type ParseFieldArray<
  T,
  TFlattenedValues extends FlattenFormValues<T> = FlattenFormValues<T>,
  TFieldArrayValues extends
    NestedObjectArrays<TFlattenedValues> = NestedObjectArrays<TFlattenedValues>,
> = {
  values: TFieldArrayValues
  keys: Extract<keyof TFieldArrayValues, string>
}

/**
 * Parses a form into its flattened keys and values and filters by field values.
 *
 * Takes a parsed form and filters by field values.
 *
 * @remarks This type has improved performance if you already have a parsed form,
 * since it doesn't have to re-flatten the form values.
 */
export type ParseFieldArrayFromParsedForm<
  T extends ParseForm<any>,
  TFieldArrayValues extends NestedObjectArrays<T['values']> = NestedObjectArrays<T['values']>,
> = {
  values: TFieldArrayValues
  keys: Extract<keyof TFieldArrayValues, string>
}
