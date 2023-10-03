import {
  FormControl,
  type FormControlOptions,
  type RegisterOptions,
  type SubmitErrorHandler,
  type SubmitHandler,
} from '@forms.js/core'
import type { FlattenObject } from 'packages/core/src/utils/types/flatten-object'
import { useRef, useCallback, useSyncExternalStore, useEffect, useState } from 'react'

export function useForm<TValues extends Record<string, any>, TContext = any>(
  options?: FormControlOptions<TValues, TContext>,
) {
  /**
   * Ensure that the form control properly mounts with a state variable.
   * Also used to force updates, i.e. after a reset.
   */
  const [mounted, setMounted] = useState(0)

  const formControlRef = useRef<FormControl<TValues, TContext>>()

  formControlRef.current ??= new FormControl(options)

  const formControl = formControlRef.current

  const register = <T extends keyof FlattenObject<TValues>>(
    name: Extract<T, string>,
    options?: RegisterOptions<TValues, T>,
  ) => {
    const { registerElement, unregisterElement } = formControl.register(name, options)

    const onChange = async (event: React.ChangeEvent) => {
      return await formControl.handleChange(event.nativeEvent)
    }

    const props = {
      name,
      onBlur: onChange,
      onChange,
      ref: (instance: HTMLElement | null) => {
        if (instance) {
          registerElement(instance as HTMLInputElement)
        } else {
          unregisterElement()
        }
      },
    }

    return props
  }

  const handleSubmit = (
    onValid?: SubmitHandler<TValues>,
    onInvalid?: SubmitErrorHandler<TValues>,
  ) => {
    const handler = formControl.handleSubmit(onValid, onInvalid)

    return async (event: React.SyntheticEvent) => {
      return await handler(event as any)
    }
  }

  const setError = useCallback(
    mounted ? formControl.setError.bind(formControl) : formControl.mockSetError.bind(formControl),
    [mounted],
  )

  const subDerived = useCallback((callback: () => void) => {
    return formControl.derivedState.subscribe(callback)
  }, [])

  const valueDerived = useCallback(() => {
    return formControl.derivedState.value
  }, [])

  useSyncExternalStore(subDerived, valueDerived)

  useEffect(() => {
    if (mounted) {
      formControl.reset(options?.values, formControl.options.resetOptions)
      setMounted((m) => m + 1)
    }
  }, [options?.values])

  useEffect(() => {
    formControl.mount()

    setMounted(1)

    return () => {
      formControl.unmount()
    }
  }, [])

  useEffect(() => {
    formControl.cleanup()
  })

  return {
    formControl,
    register,
    setError,
    handleSubmit,
    formState: formControl.derivedState.proxy,
    getValues: formControl.getValues.bind(formControl),
    unregister: formControl.unregister.bind(formControl),
    setValue: formControl.setValue.bind(formControl),
    trigger: formControl.trigger.bind(formControl),
  }
}
