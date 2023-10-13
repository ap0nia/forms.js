import type { RegisterOptions, Validate } from '@forms.js/core'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'

import type { Control } from './form-control'

export type FieldArray<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
> = FieldArrayPathValue<TFieldValues, TFieldArrayName> extends
  | ReadonlyArray<infer U>
  | null
  | undefined
  ? U
  : never

export type UseFieldArrayProps<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TFieldArrayName extends keyof FlattenObject<TFieldValues> = keyof FlattenObject<TFieldValues>,
  TKeyName extends string = 'id',
> = {
  name: TFieldArrayName
  keyName?: TKeyName
  control?: Control<TFieldValues>
  rules?: {
    validate?:
      | Validate<FieldArray<TFieldValues, TFieldArrayName>[], TFieldValues>
      | Record<string, Validate<FieldArray<TFieldValues, TFieldArrayName>[], TFieldValues>>
  } & Pick<RegisterOptions<TFieldValues>, 'maxLength' | 'minLength' | 'required'>
  shouldUnregister?: boolean
}

export function useFieldArray<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TFieldArrayName extends keyof FlattenObject<TFieldValues> = keyof FlattenObject<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>,
): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> {
  props
}
