import type { FieldError, ParseForm } from '@forms.js/core'

import { useController, type UseControllerProps, type UseControllerReturn } from './use-controller'

export type ControllerFieldState = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  error?: FieldError
}

export type ControllerRenderFunction<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm = ParseForm<TValues>,
  TKey extends keyof TParsedForm = keyof TParsedForm,
> = (props: UseControllerReturn<TValues, TParsedForm, TKey>) => React.ReactElement

export type ControllerProps<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TKey extends keyof TParsedForm = keyof TParsedForm,
> = { render: ControllerRenderFunction<TValues, TParsedForm, TKey> } & UseControllerProps<
  TValues,
  TParsedForm,
  TKey
>

export function Controller<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TKey extends keyof TParsedForm = keyof TParsedForm,
>(props: ControllerProps<TValues, TParsedForm, TKey>): React.ReactElement {
  return props.render(useController(props))
}
