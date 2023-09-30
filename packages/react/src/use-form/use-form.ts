import { FormControl } from '@forms.js/core'
import type {
  FormControlState,
  FormControlValues,
  FormControlOptions,
  RegisterOptions,
} from '@forms.js/core'
import { getRuleValue } from '@forms.js/core/validation/get-rule-value'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

// export type UseFormReturn<TValues extends Record<string, any>, TContext = any> = {
//   formControl: FormControl<TValues, TContext>
//   register: UseFormRegister<TValues>
//   getValues: GetValues<TValues>
//   handleSubmit: HandleSubmit<TValues>
// }

export function useForm<TValues extends Record<string, any>, TContext = any>(
  options?: FormControlOptions<TValues, TContext>,
) {
  const formControl = useMemo(() => {
    return new FormControl<TValues, TContext>(options)
  }, [options])

  const [values, setValues] = useState(formControl.state.values.value)

  const register = useCallback<UseFormRegister<TValues>>(
    (name, options = {}) => {
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
        onChange: (event) => formControl.handleChange(event.nativeEvent),
        onBlur: (event) => formControl.handleChange(event.nativeEvent),
      }

      if (options?.disabled) {
        props.disabled = options.disabled
      }

      if (formControl.options.progressive) {
        props.required = !!options.required
        props.min = getRuleValue(options.min)
        props.max = getRuleValue(options.max)
        props.minLength = getRuleValue(options.minLength) as number
        props.maxLength = getRuleValue(options.maxLength) as number
        props.pattern = getRuleValue(options.pattern) as string
      }

      return props
    },
    [formControl, options],
  )

  const setter = useCallback((newValues: any) => {
    setValues({ ...newValues })
    // setValues(() => ({ ...newValues }))
  },[])

  const formState = useRef<FormControlState<TValues>>({
    // isDirty: boolean,
    // isLoading: boolean,
    // isSubmitted: boolean,
    // isSubmitSuccessful: boolean,
    // isSubmitting: boolean,
    // isValidating: boolean,
    // isValid: boolean,
    // submitCount: number,
    // dirtyFields: {},
    // touchedFields: Partial<Readonly<DeepMap<T, boolean>>>,
    // defaultValues: DeepPartial<T>,
    // values: T,
    // errors: FieldErrors<T>,
    // status: FormControlStatus,
  } as any)

  useEffect(() => {
    formControl.state.values.subscribe(setter)

    return () => {
      // unsubscribeFunctions.current.forEach((unsubscribe) => unsubscribe())
    }
  }, [])

  return {
    formControl,
    register,
    getValues: formControl.getValues.bind(formControl),
    handleSubmit: formControl.handleSubmit.bind(formControl),
    formState: formState.current,
  }
}
