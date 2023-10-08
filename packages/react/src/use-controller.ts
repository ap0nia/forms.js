import { INPUT_EVENTS } from '@forms.js/core'
import type { FormControl, RegisterOptions, FormControlState } from '@forms.js/core'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { getEventValue } from 'packages/core/src/logic/html/get-event-value'
import { safeGet } from 'packages/core/src/utils/safe-get'
import { useRef, useCallback, useState, useEffect } from 'react'

import { useFormControlContext } from './use-form-context'

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
  control?: FormControl<TValues>
  disabled?: boolean
}

export function useController<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
>(props: UseControllerProps<TValues, TName>) {
  const formControl = useFormControlContext<TValues>()

  const [formState, setFormState] = useState<FormControlState<TValues>>({
    isDirty: formControl.state.isDirty.value,
    isLoading: formControl.state.isLoading.value,
    isSubmitted: formControl.state.isSubmitted.value,
    isSubmitSuccessful: formControl.state.isSubmitSuccessful.value,
    isSubmitting: formControl.state.isSubmitting.value,
    isValidating: formControl.state.isValidating.value,
    isValid: formControl.state.isValid.value,
    submitCount: formControl.state.submitCount.value,
    dirtyFields: formControl.state.dirtyFields.value,
    touchedFields: formControl.state.touchedFields.value,
    defaultValues: formControl.state.defaultValues.value,
    errors: formControl.state.errors.value,
    values: formControl.state.values.value,
    status: formControl.state.status.value,
  })

  const value = formControl.getValues(props.name)

  const registerProps = useRef(formControl.registerReact(props.name, { ...props.rules, value }))

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
    setFormState
  }, [])

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
    // formState,
    fieldState: Object.defineProperties(
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
    ), // as ControllerFieldState,
  }
}
