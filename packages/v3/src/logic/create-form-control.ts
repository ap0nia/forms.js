import { isReadonlyArray } from '../lib/is-readonly-array'
import type { FlattenObject } from '../type-utils/flatten-object'
import type { UseFormGetValues, UseFormProps } from '../types/form'
import type { Nullish } from '../types/utils'

export function createFormControl<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TContext = any,
>(props: UseFormProps<TFieldValues, TContext> = {}, flushRootRender: () => void) {
  const values = {} as FlattenObject<TFieldValues>

  const getValues = (
    fieldNames?:
      | Nullish
      | keyof FlattenObject<TFieldValues>
      | ReadonlyArray<keyof FlattenObject<TFieldValues>>,
  ) => {
    if (fieldNames == null) {
      return values
    }

    if (isReadonlyArray(fieldNames)) {
      return fieldNames.map((key) => values[key])
    }

    return values[fieldNames]
  }

  return {
    props,
    getValues: getValues as UseFormGetValues<TFieldValues>,
    flushRootRender,
  }
}
