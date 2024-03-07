import { deepSet } from '@forms.js/common/utils/deep-set'
import { safeGet } from '@forms.js/common/utils/safe-get'
import { INPUT_EVENTS, type ParseForm } from '@forms.js/core'
import type { Field, FieldError, FormControlState, RegisterOptions } from '@forms.js/core'
import { getEventValue } from '@forms.js/core/html/get-event-value'
import { useRef, useCallback, useEffect, useMemo } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'
import { useSubscribe } from './use-subscribe'

export type ControllerFieldState = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  error?: FieldError
}

export type UseControllerRules<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TName extends TParsedForm['keys'] = TParsedForm['keys'],
> = Omit<
  RegisterOptions<TValues, TName>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>

export type UseControllerProps<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TName extends TParsedForm['keys'] = TParsedForm['keys'],
> = {
  name: Extract<TName, string>
  rules?: UseControllerRules<TValues, TParsedForm, TName>
  shouldUnregister?: boolean
  defaultValue?: TParsedForm['values'][TName]
  control?: Control<TValues>
  disabled?: boolean
}

export type ControllerRenderProps<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TName extends TParsedForm['keys'] = TParsedForm['keys'],
> = {
  name: TName
  value: TParsedForm['values'][TName]
  disabled?: boolean
  onChange: (...event: any[]) => void
  onBlur: () => void
  ref: (instance: HTMLInputElement | null) => void
}

export type UseControllerReturn<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TName extends TParsedForm['keys'] = TParsedForm['keys'],
> = {
  field: ControllerRenderProps<TValues, TParsedForm, TName>
  fieldState: ControllerFieldState
  formState: FormControlState<TValues>
}

export function useController<
  TValues extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
  TName extends TParsedForm['keys'] = TParsedForm['keys'],
>(
  props: UseControllerProps<TValues, TParsedForm, TName>,
): UseControllerReturn<TValues, TParsedForm, TName> {
  const { name, disabled, shouldUnregister, rules } = props
  const action = 'action'

  const context = useFormContext<TValues>()

  const control = props.control ?? context.control

  const formState = useSubscribe({ control: control, name })

  // Always subscribe to values.
  formState.values

  const value: any = control.getValues(name) ?? props.defaultValue

  const registerProps = useRef(control.register(name, { ...rules, value }))

  registerProps.current = control.register(name, rules)

  const fieldState = useMemo(() => {
    return Object.defineProperties(
      {},
      {
        invalid: {
          enumerable: true,
          get: () => {
            const invalid = !!safeGet(formState.errors, name)
            return invalid
          },
        },
        isDirty: {
          enumerable: true,
          get: () => !!safeGet(formState.dirtyFields, name),
        },
        isTouched: {
          enumerable: true,
          get: () => !!safeGet(formState.touchedFields, name),
        },
        error: {
          enumerable: true,
          get: () => safeGet(formState.errors, name),
        },
      },
    ) as ControllerFieldState
  }, [formState, props.name])

  const fieldIsDisabled = useMemo(
    () => props.disabled || control.state.value.disabled || formState.disabled,
    [disabled, control, formState],
  )

  const onChange = useCallback(
    async (event: any) => {
      return await registerProps.current.onChange({
        nativeEvent: {
          type: INPUT_EVENTS.CHANGE,
          target: {
            name: props.name,
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
  }, [control, registerProps.current, name])

  const ref = useCallback(
    (instance: HTMLInputElement | HTMLTextAreaElement | null) => {
      const field = safeGet(control.fields, props.name)

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

    const updateMounted = (name: string, value: boolean) => {
      const field: Field | undefined = safeGet(control.fields, name)

      if (field) {
        field._f.mount = value
      }
    }

    updateMounted(name, true)

    if (shouldUnregisterField) {
      const value = structuredClone(safeGet(control.options.defaultValues, props.name))

      deepSet(control.state.value.defaultValues, props.name, value)

      if (safeGet(control.state.value.values, props.name) == null) {
        deepSet(control.state.value.values, props.name, value)
      }
    }

    return () => {
      const isArrayField = control.names.array.has(
        name.substring(0, name.search(/\.\d+(\.|$)/)) || name,
      )

      if (isArrayField ? shouldUnregisterField && !action : shouldUnregisterField) {
        control.unregister(name)
      } else {
        updateMounted(name, false)
      }
    }
  }, [control, name, shouldUnregister])

  useEffect(() => {
    if (safeGet(control.fields, name)) {
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
