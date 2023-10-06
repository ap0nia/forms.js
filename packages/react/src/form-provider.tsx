import { createContext } from 'react'

import type { ReactFormControl } from './form-control'

export const FormControlContext = createContext<ReactFormControl<any, any, any>>(undefined!)

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
  return (
    <FormControlContext.Provider value={props.control}>
      {props.children}
    </FormControlContext.Provider>
  )
}
