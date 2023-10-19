import { useContext } from 'react'

import { FormContext } from './form-provider'
import type { UseFormReturn } from './use-form'

export function useFormContext<
  TValues extends Record<string, any>,
  TContext = any,
  TransformedValues extends Record<string, any> | undefined = undefined,
>(): UseFormReturn<TValues, TContext, TransformedValues> {
  const context = useContext(FormContext)
  return context
}
