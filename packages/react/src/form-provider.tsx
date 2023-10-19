import { createContext, useCallback, useSyncExternalStore } from 'react'

import type { Control } from './control'
import type { UseFormReturn } from './use-form'

export type FormProviderProps<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
> = {
  children?: React.ReactNode
  control: Control<TValues, TContext, TTransformedValues>
} & Partial<UseFormReturn<TValues, TContext, TTransformedValues>>

export const FormContext = createContext<UseFormReturn<any, any, any>>(undefined!)

export function FormProvider<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
>(props: FormProviderProps<TValues, TContext, TTransformedValues>) {
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
  } as UseFormReturn<TValues, TContext, TTransformedValues>

  return <FormContext.Provider value={value}>{props.children}</FormContext.Provider>
}
