import type { FieldError, ParseForm } from '@forms.js/core'

import { useController, type UseControllerProps, type UseControllerReturn } from './use-controller'

export type ControllerFieldState = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  error?: FieldError
  isValidating: boolean
}

export type ControllerRenderFunction<
  TValues extends Record<string, any> = Record<string, any>,
  TKey extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
> = (props: UseControllerReturn<TValues, TKey>) => React.ReactElement

export type ControllerProps<
  TValues extends Record<string, any> = Record<string, any>,
  TKey extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
> = { render: ControllerRenderFunction<TValues, TKey> } & UseControllerProps<TValues, TKey>

export function Controller<
  TValues extends Record<string, any> = Record<string, any>,
  TKey extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
>(props: ControllerProps<TValues, TKey>): React.ReactElement {
  return props.render(useController(props))
}
