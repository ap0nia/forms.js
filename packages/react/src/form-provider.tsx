import type { FormControlState } from '@forms.js/core'
import { createContext, useCallback, useSyncExternalStore } from 'react'

import type { ReactFormControl } from './form-control'

export type FormControlContextValue<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TControl extends ReactFormControl<TValues, TContext, TTransformedValues> = ReactFormControl<
    TValues,
    TContext,
    TTransformedValues
  >,
> = {
  control: TControl
  formState: FormControlState<TValues>
} & {
  setValue: TControl['setValue']
  register: TControl['registerReact']
}

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
        control: props.control as any,
        formState: props.control.derivedState.proxy as any,
        setValue: props.control.setValue.bind(props.control),
        register: props.control.registerReact.bind(props.control),
      }}
    >
      {props.children}
    </FormControlContext.Provider>
  )
}

export { FormControlProvider as FormProvider }
