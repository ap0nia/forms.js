import { cloneObject } from '@hookform/common/utils/clone-object'
import { get } from '@hookform/common/utils/get'
import { set } from '@hookform/common/utils/set'
import { INPUT_EVENTS, type ParseForm } from '@hookform/core'
import type { Field, FormControlState, RegisterOptions } from '@hookform/core'
import { getEventValue } from '@hookform/core/html/get-event-value'
import { useCallback, useRef, useEffect, useMemo } from 'react'

import type { Control } from './control'
import type { ControllerFieldState } from './controller'
import { useFormContext } from './use-form-context'
import { useSubscribe } from './use-subscribe'
import { useWatch } from './use-watch'

export type UseControllerRules<
  TValues = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
> = Omit<
  RegisterOptions<TValues, TName>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>

export type UseControllerProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
> = {
  name: TName
  rules?: UseControllerRules<TValues, TName>
  shouldUnregister?: boolean
  defaultValue?: ParseForm<TValues>[TName]
  control?: Control<TValues>
  disabled?: boolean
}

export type ControllerRenderProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
> = {
  name: TName
  value: ParseForm<TValues>[TName]
  disabled?: boolean
  onChange: (...event: any[]) => void
  onBlur: () => void
  ref: (instance: HTMLElement | null) => void
}

export type UseControllerReturn<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
> = {
  field: ControllerRenderProps<TValues, TName>
  fieldState: ControllerFieldState
  formState: FormControlState<TValues>
}

export function useController<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
>(props: UseControllerProps<TValues, TName>): UseControllerReturn<TValues, TName> {
  const { name, disabled, shouldUnregister, rules } = props

  const context = useFormContext<TValues>()

  const control = props.control ?? context?.control

  const formState = useSubscribe({ control, name, exact: 'context' })

  const value = useWatch({
    control,
    name,
    defaultValue: get(
      control._formValues,
      name,
      get(control._defaultValues, name, props.defaultValue),
    ),
    exact: true,
  })

  const registerProps = useRef(control.register(name, { ...rules, value }))

  registerProps.current = control.register(name, rules)

  const fieldState = useMemo(
    () =>
      Object.defineProperties(
        {},
        {
          invalid: {
            enumerable: true,
            get: () => Boolean(get(formState.errors, name)),
          },
          isDirty: {
            enumerable: true,
            get: () => Boolean(get(formState.dirtyFields, name)),
          },
          isTouched: {
            enumerable: true,
            get: () => Boolean(get(formState.touchedFields, name)),
          },
          error: {
            enumerable: true,
            get: () => get(formState.errors, name),
          },
          isValidating: {
            enumerable: true,
            get: () => !!get(formState.validatingFields, name),
          },
        },
      ) as ControllerFieldState,
    [formState, name],
  )

  const fieldIsDisabled = useMemo(
    () => disabled || formState.disabled,
    [disabled, formState.disabled],
  )

  const onChange = useCallback(
    async (event: any) => {
      return await registerProps.current.onChange({
        nativeEvent: {
          type: INPUT_EVENTS.CHANGE,
          target: {
            name,
            value: getEventValue(event),
          },
        },
      } as any)
    },
    [registerProps.current, name],
  )

  const onBlur = useCallback(async () => {
    return await registerProps.current.onBlur({
      nativeEvent: {
        type: INPUT_EVENTS.BLUR,
        target: {
          name,
          value: control.getValues(name),
        },
      },
    } as any)
  }, [registerProps.current, name])

  const ref = useCallback(
    (instance: HTMLElement | null) => {
      if (instance == null) return

      const element = instance as HTMLInputElement | HTMLTextAreaElement

      const field = get(control.fields, name)

      if (field) {
        field._f.ref = {
          focus: () => element.focus(),
          select: () => element.select(),
          setCustomValidity: (message: string) => element.setCustomValidity(message),
          reportValidity: () => element.reportValidity(),
        }
      }
    },
    [name],
  )

  useEffect(() => {
    const shouldUnregisterField = shouldUnregister || control.options.shouldUnregister

    const updateMounted = (name: PropertyKey, value: boolean) => {
      const field: Field | undefined = get(control.fields, name)

      if (field) {
        field._f.mount = value
      }
    }

    updateMounted(name, true)

    if (shouldUnregisterField) {
      const value = cloneObject(get(control.options.defaultValues, props.name))

      set(control._defaultValues, props.name, value)

      if (get(control._formValues, props.name) == null) {
        set(control._formValues, props.name, value)
      }
    }

    return () => {
      const nameString = name.toString()

      const isArrayField = control.names.array.has(
        nameString.substring(0, nameString.search(/\.\d+(\.|$)/)) || nameString,
      )

      if (isArrayField ? shouldUnregisterField && !control.action.value : shouldUnregisterField) {
        control.unregister(name)
      } else {
        updateMounted(name, false)
      }
    }
  }, [control, name, shouldUnregister])

  useEffect(() => {
    if (get(control.fields, name)) {
      control.updateDisabledField({ fields: control.fields, ...props })
    }
  }, [control, name, disabled])

  return {
    field: {
      name,
      value,
      ...(fieldIsDisabled && { disabled: fieldIsDisabled }),
      onChange,
      onBlur,
      ref,
    },
    formState,
    fieldState,
  }
}
