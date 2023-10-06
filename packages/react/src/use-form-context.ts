import { useContext } from 'react'

import type { ReactFormControl } from './form-control'
import { FormContext } from './form-provider'

export function useFormContext<
  TFieldValues extends Record<string, any>,
  TContext = any,
  TransformedValues extends Record<string, any> | undefined = undefined,
>() {
  const context = useContext(FormContext)
  return context as ReactFormControl<TFieldValues, TContext, TransformedValues>
}
