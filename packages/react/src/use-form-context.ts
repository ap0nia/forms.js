import { useContext } from 'react'

import type { ReactFormControl } from './form-control'
import { FormControlContext } from './form-provider'

export function useFormControlContext<
  TFieldValues extends Record<string, any>,
  TContext = any,
  TransformedValues extends Record<string, any> | undefined = undefined,
>() {
  const context = useContext(FormControlContext)
  return context as ReactFormControl<TFieldValues, TContext, TransformedValues>
}
