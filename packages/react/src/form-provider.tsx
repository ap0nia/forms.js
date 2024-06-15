import { createContext, useCallback, useSyncExternalStore } from 'react'

import type { Control } from './control'
import type { UseFormReturn } from './use-form'

export type FormProviderProps<TValues extends Record<string, any>, TContext = any> = {
  children?: React.ReactNode
  control: Control<TValues, TContext>
} & Partial<UseFormReturn<TValues, TContext>>

export const FormContext = createContext<UseFormReturn<any, any>>(undefined!)

export function FormProvider<TValues extends Record<string, any>, TContext = any>(
  props: FormProviderProps<TValues, TContext>,
) {
  const { control, ...rest } = props

  const subscribe = useCallback(
    (callback: () => void) => control.state.subscribe(callback),
    [control],
  )

  const getSnapshot = useCallback(() => control.state.value, [control])

  const getServerSnapshot = useCallback(() => control.state.value, [control])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const value = {
    control,
    ...rest,
  } as UseFormReturn<TValues, TContext>

  return <FormContext.Provider value={value}>{props.children}</FormContext.Provider>
}
