import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react'

import { Control, type ControlOptions } from './control'

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
  formState: TControl['batchedState']['proxy']
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
  const formControlRef = useRef<Control<TValues, TContext, TTransformedValues>>()

  formControlRef.current ??= new Control(props)

  const control = formControlRef.current

  const form = useRef<UseFormReturn<TValues, TContext, TTransformedValues>>({
    control: control,
    register: control.register.bind(control),
    handleSubmit: control.handleSubmit.bind(control),
    unregister: control.unregister.bind(control),
    formState: control.batchedState.proxy,
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
      return control.batchedState.subscribe(callback)
    },
    [control],
  )

  const getSnapshot = useCallback(() => {
    return control.batchedState.value
  }, [control])

  const getServerSnapshot = useCallback(() => {
    return control.batchedState.value
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
