import type { ParseForm, RegisterOptions } from '@hookform/core'

export type UseFormRegister<TValues extends Record<string, any>> = <
  TFieldName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
>(
  name: TFieldName,
  options?: RegisterOptions<TValues, TFieldName>,
) => UseFormRegisterReturn<TFieldName>

export type UseFormRegisterReturn<TFieldName extends PropertyKey = string> = {
  onChange: ChangeHandler
  onBlur: ChangeHandler
  ref: RefCallBack
  name: TFieldName
  min?: string | number
  max?: string | number
  maxLength?: number
  minLength?: number
  pattern?: string
  required?: boolean
  disabled?: boolean
}

export type RefCallBack = (instance: any) => void

export type ChangeHandler = (event: React.ChangeEvent) => Promise<void | boolean>
