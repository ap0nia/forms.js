import { useContext } from 'react'

import { FormControlContext, type FormControlContextValue } from './form-provider'

export function useFormControlContext<
  TValues extends Record<string, any>,
  TContext = any,
  TransformedValues extends Record<string, any> | undefined = undefined,
>() {
  const context = useContext(FormControlContext)
  return context as FormControlContextValue<TValues, TContext, TransformedValues>
}
