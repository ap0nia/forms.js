import { deepEqual } from '@forms.js/core/utils/deep-equal'
import type { Defaults } from 'packages/core/src/utils/types/defaults'
import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react'

import { ReactFormControl as Control, type FormControlOptions } from './form-control'

export type UseFormReturn<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TControl extends Control<TValues, TContext, TTransformedValues> = Control<
    TValues,
    TContext,
    TTransformedValues
  >,
> = {
  control: TControl
  register: TControl['registerReact']
  handleSubmit: TControl['handleSubmitReact']
  unregister: TControl['unregister']
  formState: TControl['derivedState']['proxy']
  watch: TControl['watch']
  reset: TControl['reset']
  setError: TControl['setError']
  clearErrors: TControl['clearErrors']
  setValue: TControl['setValue']
  setFocus: TControl['setFocus']
  getValues: TControl['getValues']
  getFieldState: TControl['getFieldState']
  trigger: TControl['trigger']
}

export function useForm<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TDefaultValues extends Defaults<TValues> = any,
>(
  props?: FormControlOptions<TValues, TContext, TTransformedValues, TDefaultValues>,
): UseFormReturn<TValues, TContext, TTransformedValues> {
  const formControlRef = useRef<Control<TValues, TContext, TTransformedValues>>()

  formControlRef.current ??= new Control(props)

  const control = formControlRef.current

  const form = useRef<UseFormReturn<TValues, TContext, TTransformedValues>>({
    control: control,
    register: control.registerReact.bind(control),
    handleSubmit: control.handleSubmitReact.bind(control),
    unregister: control.unregister.bind(control),
    formState: control.derivedState.proxy,
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
    (callback: () => void) => {
      return control.derivedState.subscribe(callback)
    },
    [control],
  )

  const getSnapshot = useCallback(() => {
    return control.derivedState.value
  }, [control])

  const getServerSnapshot = useCallback(() => {
    return control.derivedState.value
  }, [control])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (props?.values && !deepEqual(props.values, control.state.values.value)) {
      control.reset(props.values, control.options.resetOptions)
    } else {
      control.resetDefaultValues()
    }
  }, [props?.values, control])

  useEffect(() => {
    if (!control.state.status.value.mount) {
      // control.updateValid()
    }
    control.cleanup()
  })

  useEffect(() => {
    control.mount()

    return () => {
      control.unmount()
    }
  }, [])

  return form.current
}
