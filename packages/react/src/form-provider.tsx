import { createContext, useCallback, useSyncExternalStore } from 'react'

import type { ReactFormControl } from './form-control'

export type FormControlContextValue<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TControl extends ReactFormControl<TValues, TContext, TTransformedValues> = ReactFormControl<
    TValues,
    TContext,
    TTransformedValues
  >,
> = {
  control: TControl
  formState: TControl['state']
} & {
  setValue: TControl['setValue']
  register: TControl['registerReact']
  handleSubmit: TControl['handleSubmitReact']
}

export const FormControlContext = createContext<FormControlContextValue<any>>(undefined!)

export type FormControlProviderProps<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TControl extends ReactFormControl<TValues, TContext, TTransformedValues> = ReactFormControl<
    TValues,
    TContext,
    TTransformedValues
  >,
> = {
  children?: React.ReactNode
  control: TControl
} & {
  setValue?: TControl['setValue']
  register?: TControl['registerReact']
}

export function FormControlProvider<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
>(props: FormControlProviderProps<TValues, TContext, TTransformedValues>) {
  const subscribe = useCallback(
    (callback: () => void) => {
      return props.control.derivedState.subscribe(callback)
    },
    [props.control],
  )

  const getSnapshot = useCallback(() => {
    return props.control.derivedState.value
  }, [props.control])

  const getServerSnapshot = useCallback(() => {
    return props.control.derivedState.value
  }, [props.control])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const { control, ...rest } = props as any

  return (
    <FormControlContext.Provider
      value={{
        control,
        formState: control.derivedState.proxy,
        setValue: control.setValue.bind(props.control),
        register: control.registerReact.bind(props.control),
        handleSubmit: control.handleSubmitReact.bind(props.control),
        ...rest,
      }}
    >
      {props.children}
    </FormControlContext.Provider>
  )
}

export { FormControlProvider as FormProvider }
