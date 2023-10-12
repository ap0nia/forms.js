import { createContext, useCallback, useSyncExternalStore } from 'react'

import type { Control } from './form-control'

export type FormControlContextValue<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
> = {
  control: Control<TValues, TContext, TTransformedValues>
} & Control<TValues, TContext, TTransformedValues>

export type FormControlProviderProps<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
> = {
  children?: React.ReactNode
  control: Control<TValues, TContext, TTransformedValues>
} & Partial<Control<TValues, TContext, TTransformedValues>>

export const FormControlContext = createContext<FormControlContextValue<any, any, any>>(undefined!)

export function FormControlProvider<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
>(props: FormControlProviderProps<TValues, TContext, TTransformedValues>) {
  const { control, ...rest } = props

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

  const value = {
    control,
    ...rest,
  } as FormControlContextValue<TValues, TContext, TTransformedValues>

  return <FormControlContext.Provider value={value}>{props.children}</FormControlContext.Provider>
}

export { FormControlProvider as FormProvider }
