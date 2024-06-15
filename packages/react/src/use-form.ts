import { deepEqual } from '@hookform/common/utils/deep-equal'
import type { FormControlState } from '@hookform/core'
import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react'

import { Control, type ControlOptions } from './control'

export type UseFormReturn<TFieldValues extends Record<string, any>, TContext = any> = {
  control: Control<TFieldValues, TContext>
  formState: FormControlState<TFieldValues>
} & Pick<
  Control<TFieldValues, TContext>,
  | 'register'
  | 'handleSubmit'
  | 'unregister'
  | 'watch'
  | 'reset'
  | 'resetField'
  | 'setError'
  | 'clearErrors'
  | 'setValue'
  | 'setFocus'
  | 'getValues'
  | 'getFieldState'
  | 'trigger'
>

export function useForm<TValues extends Record<string, any>, TContext = any>(
  props: ControlOptions<TValues, TContext> = {},
): UseFormReturn<TValues, TContext> {
  const { disabled, errors, values } = props

  const formControlRef = useRef<Control<TValues, TContext>>(new Control(props))

  const control = formControlRef.current

  control.options = {
    ...control.options,
    ...props,
  }

  const form = useRef<UseFormReturn<TValues, TContext>>({
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
    resetField: control.resetField.bind(control),
  })

  const subscribe = useCallback(
    (callback: () => void) => control.state.subscribe(callback, undefined, false),
    [control],
  )

  const getSnapshot = useCallback(() => control.state.value, [control])

  const getServerSnapshot = useCallback(() => control.state.value, [control])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (control.isTracking('isDirty')) {
      const isDirty = control.getDirty()
      control.stores.isDirty.set(isDirty)
    }
  }, [control, control._formState.isDirty])

  useEffect(() => {
    if (values && !deepEqual(values, control._formValues)) {
      control.reset(values as any, control.options.resetOptions)
    } else {
      control.resetDefaultValues()
    }
  }, [control, values])

  useEffect(() => {
    if (errors) {
      control.setErrors(errors)
    }
  }, [control, errors])

  useEffect(() => {
    control.disableForm(disabled)
  }, [control, disabled])

  useEffect(() => {
    if (!control.mounted) {
      control.updateValid()
      control.mounted = true
    }

    control.removeUnmounted()

    if (control.needsFlush) {
      control.needsFlush = false
      control.state.flush()
    }
  })

  return form.current
}
