import { cloneObject } from '@forms.js/common/utils/clone-object'
import { get } from '@forms.js/common/utils/get'
import { set } from '@forms.js/common/utils/set'
import { INPUT_EVENTS, type ParseForm } from '@forms.js/core'
import type { Field, FormControlState, RegisterOptions } from '@forms.js/core'
import { getEventValue } from '@forms.js/core/html/get-event-value'
import { useRef, useEffect } from 'react'

import type { Control } from './control'
import type { ControllerFieldState } from './controller'
import { useFormContext } from './use-form-context'
import { useSubscribe } from './use-subscribe'

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

  // Always subscribe to values.
  formState.values

  const value = control.getValues(name) ?? props.defaultValue

  const registerProps = useRef(control.register(name, { ...rules, value }))

  registerProps.current = control.register(name, rules)

  const fieldState = Object.defineProperties(
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
  ) as ControllerFieldState

  const fieldIsDisabled = disabled || formState.disabled

  const onChange = async (event: any) => {
    return await registerProps.current.onChange({
      nativeEvent: {
        type: INPUT_EVENTS.CHANGE,
        target: {
          name: props.name,
          value: getEventValue(event),
        },
      },
    } as any)
  }

  const onBlur = async () => {
    return await registerProps.current.onBlur({
      nativeEvent: {
        type: INPUT_EVENTS.BLUR,
        target: {
          name,
          value: control.getValues(name),
        },
      },
    } as any)
  }

  const ref = (instance: HTMLElement | null) => {
    if (instance == null) return

    const element = instance as HTMLInputElement | HTMLTextAreaElement

    const field = get(control.fields, props.name)

    if (field) {
      field._f.ref = {
        focus: () => element.focus(),
        select: () => element.select(),
        setCustomValidity: (message: string) => element.setCustomValidity(message),
        reportValidity: () => element.reportValidity(),
      }
    }
  }

  useEffect(() => {
    const shouldUnregisterField = props.shouldUnregister || control.options.shouldUnregister

    const updateMounted = (name: PropertyKey, value: boolean) => {
      const field: Field | undefined = get(control.fields, name)

      if (field) {
        field._f.mount = value
      }
    }

    updateMounted(name, true)

    if (shouldUnregisterField) {
      const value = cloneObject(get(control.options.defaultValues, props.name))

      set(control.state.value.defaultValues, props.name, value)

      if (get(control.state.value.values, props.name) == null) {
        set(control.state.value.values, props.name, value)
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
