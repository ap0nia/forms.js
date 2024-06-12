import { deepEqual } from '@forms.js/common/utils/deep-equal'
import type { ParseForm } from '@forms.js/core'
import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react'

import { Control, type ControlOptions } from './control'

export type UseFormReturn<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TControl extends Control<TValues, TContext, TTransformedValues, TParsedForm> = Control<
    TValues,
    TContext,
    TTransformedValues,
    TParsedForm
  >,
> = {
  control: TControl
  formState: TControl['state']['value']
} & Pick<
  TControl,
  | 'register'
  | 'handleSubmit'
  | 'unregister'
  | 'watch'
  | 'reset'
  | 'setError'
  | 'clearErrors'
  | 'setValue'
  | 'setFocus'
  | 'getValues'
  | 'getFieldState'
  | 'trigger'
>

export function useForm<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
>(props?: ControlOptions<TValues, TContext>): UseFormReturn<TValues, TContext, TTransformedValues> {
  const { disabled, errors, shouldUnregister, values } = props ?? {}

  const formControlRef = useRef<Control<TValues, TContext, TTransformedValues>>(new Control(props))

  const control = formControlRef.current

  const form = useRef<UseFormReturn<TValues, TContext, TTransformedValues>>({
    control: control,
    register: control.register.bind(control),
    handleSubmit: control.handleSubmit.bind(control),
    unregister: control.unregister.bind(control),
    formState: control.state.proxy,
    watch: control.watch.bind(control),
    reset: control.reset.bind(control),
    setError: control.setError.bind(control),
    clearErrors: control.clearErrors.bind(control),
    setValue: control.setValue.bind(control),
    setFocus: control.setFocus.bind(control),
    getValues: control.getValues.bind(control),
    getFieldState: control.getFieldState.bind(control),
    trigger: control.trigger.bind(control),
  })

  const subscribe = useCallback(
    (callback: () => void) => control.state.subscribe(callback, undefined, false),
    [control],
  )

  const getSnapshot = useCallback(() => control.state.value, [control])

  const getServerSnapshot = useCallback(() => control.state.value, [control])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (values && !deepEqual(values, control.state.value.values)) {
      control.reset(values, control.options.resetOptions)
    } else {
      control.resetDefaultValues()
    }
  }, [values, control])

  useEffect(() => {
    if (errors) {
      control.setErrors(errors)
    }
  }, [errors, control])

  useEffect(() => {
    control.handleDisabled(disabled)
  }, [disabled])

  useEffect(() => {
    if (!control.mounted) {
      control.updateValid()
      control.mounted = true
    }
    control.removeUnmounted()
  })

  useEffect(() => {
    if (shouldUnregister) {
      /**
       * @todo: Notify subscribers, but without changing the actual value?
       */
      // control.stores.values.set(control.getWatch())
    }
  }, [shouldUnregister, control])

  return form.current
}
