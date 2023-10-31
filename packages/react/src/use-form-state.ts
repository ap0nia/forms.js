import { Batchable } from '@forms.js/common/store'
import type { FormControlState, FormFieldNames } from '@forms.js/core'
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

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

  const mounted = useRef(false)

  const previousDerivedState = useRef<Batchable<Control<T>['stores']>>()

  const derivedState = useMemo<Batchable<Control<T>['stores']>>(() => {
    if (previousDerivedState.current) {
      control.state.children.delete(previousDerivedState.current)
    }

    const derived = new Batchable(control.stores, new Set())

    control.state.children.add(derived)

    previousDerivedState.current = derived

    return derived
  }, [control, props?.name])

  const proxy = useMemo(() => {
    return derivedState.createTrackingProxy(props?.name, props, false)
  }, [derivedState, props?.name, props?.disabled, props?.exact])

  useEffect(() => {
    return () => {
      if (previousDerivedState.current) {
        control.state.children.delete(previousDerivedState.current)
        previousDerivedState.current = undefined
      }
    }
  }, [])

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
    [props?.name, control, derivedState, props?.disabled],
  )

  const getSnapshot = useCallback(() => {
    return derivedState.writable.value
  }, [derivedState])

  const getServerSnapshot = useCallback(() => {
    return derivedState.writable.value
  }, [derivedState])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    mounted.current = true

    if (derivedState.proxy.isValid) {
      control.updateValid(true)
    }

    return () => {
      mounted.current = false
    }
  }, [control])

  return proxy
}
