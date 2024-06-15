import { useContext } from 'react'

import { FormContext } from './form-provider'
import type { UseFormReturn } from './use-form'

export function useFormContext<
  TValues extends Record<string, any>,
  TContext = any,
>(): UseFormReturn<TValues, TContext> {
  const context = useContext(FormContext)
  return context
}
