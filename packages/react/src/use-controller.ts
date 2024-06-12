import { get } from '@forms.js/common/utils/get'
import { set } from '@forms.js/common/utils/set'
import { INPUT_EVENTS, type ParseForm } from '@forms.js/core'
import type { Field, FormControlState, RegisterOptions } from '@forms.js/core'
import { getEventValue } from '@forms.js/core/html/get-event-value'
import { useRef, useCallback, useEffect } from 'react'

import type { Control } from './control'
import type { ControllerFieldState } from './controller'
import { useFormContext } from './use-form-context'
import { useSubscribe } from './use-subscribe'

export type UseControllerRules<
  TValues = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TName extends keyof TParsedForm = keyof TParsedForm,
> = Omit<
  RegisterOptions<TValues, TParsedForm, TName>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>

export type UseControllerProps<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TName extends keyof TParsedForm = keyof TParsedForm,
> = {
  name: TName
  rules?: UseControllerRules<TValues, TParsedForm, TName>
  shouldUnregister?: boolean
  defaultValue?: TParsedForm[TName]
  control?: Control<TValues, any, any, TParsedForm>
  disabled?: boolean
}

export type ControllerRenderProps<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm = ParseForm<TValues>,
  TName extends keyof TParsedForm = keyof TParsedForm,
> = {
  name: TName
  value: TParsedForm[TName]
  disabled?: boolean
  onChange: (...event: any[]) => void
  onBlur: () => void
  ref: (instance: HTMLInputElement | null) => void
}

export type UseControllerReturn<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm = ParseForm<TValues>,
  TName extends keyof TParsedForm = keyof TParsedForm,
> = {
  field: ControllerRenderProps<TValues, TParsedForm, TName>
  fieldState: ControllerFieldState
  formState: FormControlState<TValues>
}

export function useController<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TName extends keyof TParsedForm = keyof TParsedForm,
>(
  props: UseControllerProps<TValues, TParsedForm, TName>,
): UseControllerReturn<TValues, TParsedForm, TName> {
  const { name, disabled, shouldUnregister, rules } = props

  const action = 'action'

  const context = useFormContext<TValues, any, any, TParsedForm>()

  const control = props.control ?? context?.control

  const formState = useSubscribe({ control, name })

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
        get: () => {
          const invalid = !!get(formState.errors, name)
          return invalid
        },
      },
      isDirty: {
        enumerable: true,
        get: () => !!get(formState.dirtyFields, name),
      },
      isTouched: {
        enumerable: true,
        get: () => !!get(formState.touchedFields, name),
      },
      error: {
        enumerable: true,
        get: () => get(formState.errors, name),
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

  const ref = useCallback(
    (instance: HTMLInputElement | HTMLTextAreaElement | null) => {
      const field = get(control.fields, props.name)

      if (field && instance) {
        field._f.ref = {
          focus: () => instance.focus(),
          select: () => instance.select(),
          setCustomValidity: (message: string) => instance.setCustomValidity(message),
          reportValidity: () => instance.reportValidity(),
        }
      }
    },
    [control, name],
  )

  useEffect(() => {
    const shouldUnregisterField = control.options.shouldUnregister || props.shouldUnregister

    const updateMounted = (name: PropertyKey, value: boolean) => {
      const field: Field | undefined = get(control.fields, name)

      if (field) {
        field._f.mount = value
      }
    }

    updateMounted(name, true)

    if (shouldUnregisterField) {
      const value = structuredClone(get(control.options.defaultValues, props.name))

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

      if (isArrayField ? shouldUnregisterField && !action : shouldUnregisterField) {
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
      name: props.name,
      value,
      ...(typeof fieldIsDisabled === 'boolean' && { disabled: fieldIsDisabled }),
      onChange,
      onBlur,
      ref,
    },
    formState,
    fieldState,
  }
}
