import {
  FormControl,
  type FormControlOptions,
  type RegisterOptions,
  type SubmitErrorHandler,
  type SubmitHandler,
} from '@forms.js/core'
import { getRuleValue } from '@forms.js/core/validation/get-rule-value'
import type { FlattenObject } from 'packages/core/src/utils/types/flatten-object'
import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react'

export function useForm<TValues extends Record<string, any>, TContext = any>(
  options?: FormControlOptions<TValues, TContext>,
) {
  const formControlRef = useRef<FormControl<TValues, TContext>>()

  formControlRef.current ??= new FormControl(options)

  const formControl = formControlRef.current

  const subscribe = useCallback((callback: () => void) => {
    return formControl.derivedState.subscribe(callback)
  }, [])

  const getSnapshot = useCallback(() => {
    return formControl.derivedState.value
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (formControl.status.value.mount) {
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

  const form = useRef({
    register: <T extends keyof FlattenObject<TValues>>(
      name: Extract<T, string>,
      options?: RegisterOptions<TValues, T>,
    ) => {
      const { registerElement, unregisterElement } = formControl.register(name, options)

      const onChange = async (event: React.ChangeEvent) => {
        return await formControl.handleChange(event.nativeEvent)
      }

      const props = {
        ...(typeof options?.disabled === 'boolean' && { disabled: options.disabled }),
        ...(formControl.options.progressive && {
          required: !!options?.required,
          min: getRuleValue(options?.min),
          max: getRuleValue(options?.max),
          minLength: getRuleValue<number>(options?.minLength) as number,
          maxLength: getRuleValue(options?.maxLength) as number,
          pattern: getRuleValue(options?.pattern) as string,
        }),
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
    },

    handleSubmit: (onValid?: SubmitHandler<TValues>, onInvalid?: SubmitErrorHandler<TValues>) => {
      const handler = formControl.handleSubmit(onValid, onInvalid)

      return async (event: React.SyntheticEvent) => {
        return await handler(event as any)
      }
    },

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

  return form.current
}
