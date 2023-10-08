import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react'

import { ReactFormControl, type FormControlOptions } from './form-control'

export function useForm<TValues extends Record<string, any>, TContext = any>(
  options?: FormControlOptions<TValues, TContext>,
) {
  const formControlRef = useRef<ReactFormControl<TValues, TContext>>()

  formControlRef.current ??= new ReactFormControl(options)

  const formControl = formControlRef.current

  const form = useRef({
    register: formControl.registerReact.bind(formControl),
    handleSubmit: formControl.handleSubmitReact.bind(formControl),
    unregister: formControl.unregister.bind(formControl),
    formState: formControl.derivedState.proxy,
    watch: formControl.watch.bind(formControl),
    reset: formControl.reset.bind(formControl),
    setError: formControl.setError.bind(formControl),
    clearErrors: formControl.clearErrors.bind(formControl),
    setValue: formControl.setValue.bind(formControl),
    setFocus: formControl.setFocus.bind(formControl),
    getValues: formControl.getValues.bind(formControl),
    getFieldState: formControl.getFieldState.bind(formControl),
    trigger: formControl.trigger.bind(formControl),
    formControl,
  })

  const subscribe = useCallback((callback: () => void) => {
    return formControl.derivedState.subscribe(callback)
  }, [])

  const getSnapshot = useCallback(() => {
    return formControl.derivedState.value
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (formControl.state.status.value.mount) {
      formControl.reset(options?.values, formControl.options.resetOptions)
    }
  }, [options?.values])

  useEffect(() => {
    formControl.cleanup()
  })

  useEffect(() => {
    formControl.mount()

    return () => {
      formControl.unmount()
    }
  }, [])

  return form.current
}
