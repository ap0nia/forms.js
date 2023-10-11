import { type FieldError, type FormControlState } from '@forms.js/core'
import type { FlattenObject } from 'packages/core/src/utils/types/flatten-object'

import { useController, type UseControllerProps } from './use-controller'

export type ControllerFieldState = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  error?: FieldError
}

export type ControllerRenderProps<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TFieldValues> = keyof FlattenObject<TFieldValues>,
> = {
  onChange: (...event: any[]) => void
  onBlur: () => void
  value: FlattenObject<TFieldValues>[TName]
  disabled?: boolean
  name: TName
  ref: (instance: HTMLInputElement | null) => void
}

export type ControllerProps<
  TValues extends Record<string, any> = Record<string, any>,
  TKey extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
> = {
  render: (props: {
    field: ControllerRenderProps<TValues, TKey>
    fieldState: ControllerFieldState
    formState: FormControlState<TValues>
  }) => React.ReactElement
} & UseControllerProps<TValues, TKey>

export function Controller<
  TValues extends Record<string, any> = Record<string, any>,
  TKey extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
>(props: ControllerProps<TValues, TKey>) {
  console.log('controller')
  return props.render(useController(props))
}
