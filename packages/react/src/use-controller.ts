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
  const context = useFormContext<TValues>()

  const formControl = props.control ?? context.control

  const formState = useSubscribe({ control: formControl, name: props.name })

  // Always subscribe to values.
  formState.values

  const value: any = formControl.getValues(props.name) ?? props.defaultValue

  const registerProps = useRef(formControl.register(props.name, { ...props.rules, value }))

  registerProps.current = formControl.register(props.name, props.rules)

  const isArrayField = useMemo(() => {
    return formControl.names.array.has(props.name)
  }, [formControl, props.name])

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
    [registerProps.current, props.name],
  )

  const onBlur = useCallback(async () => {
    return await registerProps.current.onBlur({
      nativeEvent: {
        type: INPUT_EVENTS.BLUR,
        target: {
          name: props.name,
          value: formControl.getValues(props.name),
        },
      },
    } as any)
  }, [formControl, registerProps.current, props.name])

  useEffect(() => {
    const shouldUnregisterField = formControl.options.shouldUnregister || props.shouldUnregister

    const updateMounted = (name: string, value: boolean) => {
      const field: Field | undefined = safeGet(formControl.fields, name)

      if (field) {
        field._f.mount = value
      }
    }

    updateMounted(props.name, true)

    if (shouldUnregisterField) {
      const value = structuredClone(safeGet(formControl.options.defaultValues, props.name))

      deepSet(formControl.state.value.defaultValues, props.name, value)

      if (safeGet(formControl.state.value.values, props.name)) {
        deepSet(formControl.state.value.values, props.name, value)
      }
    }

    return () => {
      if (isArrayField ? shouldUnregisterField : shouldUnregisterField) {
        formControl.unregister(props.name)
      } else {
        updateMounted(props.name, false)
      }
    }
  }, [formControl, isArrayField, props.name, props.shouldUnregister])

  useEffect(() => {
    if (safeGet(formControl.fields, props.name)) {
      formControl.updateDisabledField({ fields: formControl.fields, ...props })
    }
  }, [formControl, props.name, props.disabled])

  const fieldState = useMemo(() => {
    return Object.defineProperties(
      {},
      {
        invalid: {
          enumerable: true,
          get: () => {
            const invalid = !!safeGet(formState.errors, props.name)
            return invalid
          },
        },
        isDirty: {
          enumerable: true,
          get: () => !!safeGet(formState.dirtyFields, props.name),
        },
        isTouched: {
          enumerable: true,
          get: () => !!safeGet(formState.touchedFields, props.name),
        },
        error: {
          enumerable: true,
          get: () => safeGet(formState.errors, props.name),
        },
      },
    ) as ControllerFieldState
  }, [formState, props.name])

  const disabled = props.disabled || formControl.state.value.disabled

  return {
    field: {
      name: props.name,
      value,
      ...(typeof disabled === 'boolean' && { disabled }),
      onChange,
      onBlur,
      ref: (instance: HTMLInputElement | HTMLTextAreaElement | null) => {
        const field = safeGet(formControl.fields, props.name)

        if (field && instance) {
          field._f.ref = {
            focus: () => instance.focus(),
            select: () => instance.select(),
            setCustomValidity: (message: string) => instance.setCustomValidity(message),
            reportValidity: () => instance.reportValidity(),
          }
        }
      },
    },
    formState,
    fieldState,
  }
}
