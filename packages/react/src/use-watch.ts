import { Batchable } from '@forms.js/common/store'
import { safeGet } from '@forms.js/common/utils/safe-get'
import type { FormFieldNames } from '@forms.js/core'
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'

export type UseWatchProps<T extends Record<string, any> = Record<string, any>> = {
  name?: FormFieldNames<T> | FormFieldNames<T>[]
  exact?: boolean
  disabled?: boolean
  control?: Control<T>
  defaultValue?: any
}

export function useWatch<T extends Record<string, any>>(props?: UseWatchProps<T>) {
  const context = useFormContext<T>()

  const control = props?.control ?? context.control

  const previousDerivedState = useRef<Batchable<Control<T>['stores']>>()

  const derivedState = useMemo(() => {
    if (previousDerivedState.current) {
      control.state.children.delete(previousDerivedState.current)
    }

    const derived = new Batchable(control.stores, new Set())

    control.state.children.add(derived)

    previousDerivedState.current = derived

    return derived
  }, [control, props?.name])

  derivedState.track('values', props?.name, props)

  useEffect(() => {
    return () => {
      control.state.children.delete(derivedState)
    }
  }, [control, derivedState])

  const subscribe = useCallback(
    (callback: () => void) => {
      return derivedState.subscribe(
        () => {
          if (!props?.disabled) {
            callback()
          }
        },
        undefined,
        false,
      )
    },
    [control, props?.disabled],
  )

  const getSnapshot = useCallback(() => {
    return derivedState.writable.value
  }, [])

  const getServerSnapshot = useCallback(() => {
    return derivedState.writable.value
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const values = control.mounted
    ? derivedState.proxy.values
    : props?.defaultValue == null
    ? control.state.value.defaultValues
    : typeof props?.name === 'string'
    ? { [props.name]: props?.defaultValue }
    : props?.defaultValue

  return props?.name
    ? Array.isArray(props.name)
      ? props.name.map((n) => safeGet(values, n))
      : safeGet(values, props.name) ?? props?.defaultValue
    : values
}
