import { INPUT_EVENTS } from '@forms.js/core'
import type { Field, FieldError, FormControl, RegisterOptions } from '@forms.js/core'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { deepSet } from 'packages/common/src/utils/deep-set'
import { getEventValue } from 'packages/core/src/logic/html/get-event-value'
import { safeGet } from 'packages/core/src/utils/safe-get'
import { useRef, useCallback, useEffect, useMemo } from 'react'

import { useFormControlContext } from './use-form-context'
import { useFormState } from './use-form-state'

export type ControllerFieldState = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  error?: FieldError
}

export type UseControllerProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
> = {
  name: Extract<TName, string>
  rules?: Omit<
    RegisterOptions<TValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
  shouldUnregister?: boolean
  defaultValue?: FlattenObject<TValues>[TName]
  formControl?: FormControl<TValues>
  disabled?: boolean
}

export function useController<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
>(props: UseControllerProps<TValues, TName>) {
  const formControl = useFormControlContext<TValues>()

  const formState = useFormState({ formControl, name: props.name })

  const value = formControl.getValues(props.name)

  const registerProps = useRef(formControl.registerReact(props.name, { ...props.rules, value }))

  registerProps.current = formControl.registerReact(props.name, props.rules)

  const isArrayField = useMemo(() => {
    return formControl.names.array.has(props.name)
  }, [formControl, props.name])

  const handleChange = useCallback(
    (event: React.SyntheticEvent) =>
      registerProps.current.onChange({
        type: INPUT_EVENTS.CHANGE,
        target: {
          value: getEventValue(event),
          name: props.name,
        },
      } as any),
    [props.name],
  )

  const onBlur = useCallback(
    () =>
      registerProps.current.onBlur({
        target: {
          value: formControl.getValues(props.name),
          name: props.name,
        },
        type: INPUT_EVENTS.BLUR,
      } as any),
    [props.name, formControl],
  )

  useEffect(() => {
    const _shouldUnregisterField = formControl.options.shouldUnregister || props.shouldUnregister

    const updateMounted = (name: string, value: boolean) => {
      const field: Field | undefined = safeGet(formControl.fields, name)

      if (field) {
        field._f.mount = value
      }
    }

    updateMounted(props.name, true)

    if (_shouldUnregisterField) {
      const value = structuredClone(safeGet(formControl.options.defaultValues, props.name))

      deepSet(formControl.state.defaultValues.value, props.name, value)

      if (safeGet(formControl.state.values.value, props.name)) {
        deepSet(formControl.state.values.value, props.name, value)
      }
    }

    return () => {
      // if (isArrayField ? _shouldUnregisterField && !formControl.state.action : _shouldUnregisterField) {
      if (isArrayField ? _shouldUnregisterField : _shouldUnregisterField) {
        formControl.unregister(props.name)
      } else {
        updateMounted(props.name, false)
      }
    }
  }, [props.name, formControl, isArrayField, props.shouldUnregister])

  useEffect(() => {
    if (safeGet(formControl.fields, props.name)) {
      formControl.updateDisabledField({ fields: formControl.fields, ...props })
    }
  }, [props.disabled, props.name, formControl])

  const fieldState = useMemo(() => {
    return Object.defineProperties(
      {},
      {
        invalid: {
          enumerable: true,
          get: () => !!safeGet(formState.errors, props.name),
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

  return {
    registerProps,
    value,
    ...(typeof props.disabled === 'boolean' && { disabled: props.disabled }),
    handleChange,
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
    formState,
    fieldState,
  }
}
