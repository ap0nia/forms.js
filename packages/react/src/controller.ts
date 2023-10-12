import type { FieldError } from '@forms.js/core'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'

import { useController, type UseControllerProps, type UseControllerReturn } from './use-controller'

export type ControllerFieldState = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  error?: FieldError
}

export type ControllerRenderFunction<
  TValues extends Record<string, any> = Record<string, any>,
  TKey extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
> = (props: UseControllerReturn<TValues, TKey>) => React.ReactElement

export type ControllerProps<
  TValues extends Record<string, any> = Record<string, any>,
  TKey extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
> = { render: ControllerRenderFunction<TValues, TKey> } & UseControllerProps<TValues, TKey>

export function Controller<
  TValues extends Record<string, any> = Record<string, any>,
  TKey extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
>(props: ControllerProps<TValues, TKey>): React.ReactElement {
  return props.render(useController(props))
}
