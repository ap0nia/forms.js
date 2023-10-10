import type { FormControlState } from '@forms.js/core'
import { createContext, useCallback, useSyncExternalStore } from 'react'

import type { ReactFormControl } from './form-control'

export type FormControlContextValue<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
> = {
  formControl: ReactFormControl<TValues, TContext, TTransformedValues>
  formState: FormControlState<TValues>
}

export const FormControlContext = createContext<FormControlContextValue>(undefined!)

export type FormControlProviderProps<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
> = {
  children?: React.ReactNode
  formControl: ReactFormControl<TValues, TContext, TTransformedValues>
}

export function FormControlProvider<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
>(props: FormControlProviderProps<TValues, TContext, TTransformedValues>) {
  const subscribe = useCallback(
    (callback: () => void) => {
      return props.formControl.derivedState.subscribe(callback)
    },
    [props.formControl],
  )

  const getSnapshot = useCallback(() => {
    return props.formControl.derivedState.value
  }, [props.formControl])

  const getServerSnapshot = useCallback(() => {
    return props.formControl.derivedState.value
  }, [props.formControl])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <FormControlContext.Provider
      value={{
        formControl: props.formControl as any,
        formState: props.formControl.derivedState.proxy as any,
      }}
    >
      {props.children}
    </FormControlContext.Provider>
  )
}
