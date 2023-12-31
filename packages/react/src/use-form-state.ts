import type { FormControlState, FormFieldNames } from '@forms.js/core'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'

export type UseFormStateProps<
  T extends Record<string, any> = Record<string, any>,
  TFieldName extends FormFieldNames<T> = FormFieldNames<T>,
> = {
  control?: Control<T>
  name?: TFieldName | TFieldName[]
  disabled?: boolean
  exact?: boolean
}

export function useFormState<T extends Record<string, any>>(
  props?: UseFormStateProps<T>,
): FormControlState<T> {
  const context = useFormContext<T>()

  const control = props?.control ?? context.control

  const state = useMemo(() => control.state.clone(), [control])

  const proxy = useMemo(
    () => state.createTrackingProxy(props?.name, props, false),
    [state, props?.name, props?.disabled, props?.exact],
  )

  const subscribe = useCallback(
    (callback: () => void) => {
      return state.subscribe(() => !props?.disabled && callback(), undefined, false)
    },
    [state, props?.disabled],
  )

  const getSnapshot = useCallback(() => state.value, [state])

  const getServerSnapshot = useCallback(() => state.value, [state])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (state.proxy.isValid) {
      control.updateValid(true)
    }

    return () => {
      control.state.children.delete(state)
    }
  }, [control])

  return proxy
}
