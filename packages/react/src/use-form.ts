import { deepEqual } from '@forms.js/core/utils/deep-equal'
import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react'

import { ReactFormControl, type FormControlOptions } from './form-control'

export function useForm<TValues extends Record<string, any>, TContext = any>(
  props?: FormControlOptions<TValues, TContext>,
) {
  const formControlRef = useRef<ReactFormControl<TValues, TContext>>()

  formControlRef.current ??= new ReactFormControl(props)

  const control = formControlRef.current

  const form = useRef({
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
    control: control,
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
