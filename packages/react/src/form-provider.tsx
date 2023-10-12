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
} & Pick<ReactFormControl<TValues, TContext, TTransformedValues>, 'setValue'>

export const FormControlContext = createContext<FormControlContextValue>(undefined!)

export type FormControlProviderProps<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
> = {
  children?: React.ReactNode
  control: ReactFormControl<TValues, TContext, TTransformedValues>
}

export function FormControlProvider<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
>(props: FormControlProviderProps<TValues, TContext, TTransformedValues>) {
  const subscribe = useCallback(
    (callback: () => void) => {
      return props.control.derivedState.subscribe(callback)
    },
    [props.control],
  )

  const getSnapshot = useCallback(() => {
    return props.control.derivedState.value
  }, [props.control])

  const getServerSnapshot = useCallback(() => {
    return props.control.derivedState.value
  }, [props.control])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <FormControlContext.Provider
      value={{
        formControl: props.control as any,
        formState: props.control.derivedState.proxy as any,
        setValue: props.control.setValue.bind(props.control),
      }}
    >
      {props.children}
    </FormControlContext.Provider>
  )
}

export { FormControlProvider as FormProvider }
