import {
  FormControl,
  type FormControlOptions,
  type RegisterOptions,
  type SubmitErrorHandler,
  type SubmitHandler,
} from '@forms.js/core'
import type { FlattenObject } from 'packages/core/src/utils/types/flatten-object'
import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react'

export function useForm<TValues extends Record<string, any>, TContext = any>(
  options?: FormControlOptions<TValues, TContext>,
) {
  const formControlRef = useRef<FormControl<TValues, TContext>>()

  formControlRef.current ??= new FormControl(options)

  const formControl = formControlRef.current

  const register = <T extends keyof FlattenObject<TValues>>(
    name: Extract<T, string>,
    options?: RegisterOptions,
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

  const subDerived = useCallback((callback: () => void) => {
    return formControl.derivedState.subscribe(callback)
  }, [])

  const valueDerived = useCallback(() => {
    return formControl.derivedState.value
  }, [])

  useSyncExternalStore(subDerived, valueDerived)

  useEffect(() => {
    formControl.cleanup()
  })

  return {
    formControl,
    register,
    formState: formControl.derivedState.proxy,
    getValues: formControl.getValues.bind(formControl),
    handleSubmit,
    unregister: formControl.unregister.bind(formControl),
  }
}
