import type { ParseForm } from '@forms.js/core'
import { useContext } from 'react'

import { FormContext } from './form-provider'
import type { UseFormReturn } from './use-form'

export function useFormContext<
  TValues extends Record<string, any>,
  TContext = any,
  TransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
>(): UseFormReturn<TValues, TContext, TransformedValues, TParsedForm> {
  const context = useContext(FormContext)
  return context
}
