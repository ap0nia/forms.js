import { FormControl } from '@forms.js/core'
import type { FormControlValues, FormControlOptions, RegisterOptions } from '@forms.js/core'
import { getRuleValue } from '@forms.js/core/validation/get-rule-value'

export type UseFormRegister<TValues extends Record<string, any>> = <
  TKey extends keyof FormControlValues<TValues>,
>(
  name: Extract<TKey, string>,
  options?: RegisterOptions<TValues, TKey>,
) => RegisterProps<TKey>

export type RegisterProps<T> = {
  onChange: ChangeHandler
  onBlur: ChangeHandler
  ref: React.RefCallback<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  name: T
  min?: string | number
  max?: string | number
  maxLength?: number
  minLength?: number
  pattern?: string
  required?: boolean
  disabled?: boolean
}

export type ChangeHandler = (event: React.ChangeEvent) => unknown

export type UseFormReturn<TValues extends Record<string, any>, TContext = any> = {
  formControl: FormControl<TValues, TContext>
  register: UseFormRegister<TValues>
}

export function useForm<TValues extends Record<string, any>, TContext = any>(
  options?: FormControlOptions<TValues, TContext>,
): UseFormReturn<TValues, TContext> {
  const formControl = new FormControl<TValues, TContext>(options)

  const register: UseFormRegister<TValues> = (name, options = {}) => {
    const { registerElement, unregisterElement } = formControl.register(name, options)

    const props: RegisterProps<typeof name> = {
      name,
      ref: (instance) => {
        if (instance) {
          registerElement(instance)
        } else {
          unregisterElement()
        }
      },
      onChange: (event) => formControl.handleChange(event as any),
      onBlur: (event) => formControl.handleChange(event as any),
    }

    if (options?.disabled) {
      props.disabled = options.disabled
    }

    if (formControl.options.progressive) {
      props.required = !!options.required
      props.min = getRuleValue(options.min)
      props.max = getRuleValue(options.max)
      props.minLength = getRuleValue<number>(options.minLength) as number
      props.maxLength = getRuleValue(options.maxLength) as number
      props.pattern = getRuleValue(options.pattern) as string
    }

    return props
  }

  return {
    formControl,
    register,
  }
}
