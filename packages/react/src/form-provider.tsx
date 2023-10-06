import { createContext } from 'react'

import type { ReactFormControl } from './form-control'

export const FormContext = createContext<ReactFormControl<any, any, any>>(undefined!)

export type FormProviderProps<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
> = {
  children?: React.ReactNode
  control: ReactFormControl<TValues, TContext, TTransformedValues>
}

export function FormProvider<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
>(props: FormProviderProps<TValues, TContext, TTransformedValues>) {
  return <FormContext.Provider value={props.control}>{props.children}</FormContext.Provider>
}
