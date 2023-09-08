import type { FlattenObject } from '../type-utils/flatten-object'
import type { UseFormGetValues, UseFormProps } from '../types/form'
import { safeGetMultiple } from '../utils/safe-get-multiple'

export function createFormControl<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TContext = any,
>(props: UseFormProps<TFieldValues, TContext> = {}, flushRootRender?: () => void) {
  const values = {} as FlattenObject<TFieldValues>

  const getValues = ((fieldNames: any) => {
    return safeGetMultiple(values, fieldNames)
  }) as UseFormGetValues<TFieldValues>

  return {
    props,
    getValues,
    flushRootRender,
  }
}
