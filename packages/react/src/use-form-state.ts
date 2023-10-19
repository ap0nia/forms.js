import { RecordDerived } from '@forms.js/common/store'
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

  const previousDerivedState = useRef<RecordDerived<Control<T>['state']>>()

  const derivedState = useMemo<RecordDerived<Control<T>['state']>>(() => {
    if (previousDerivedState.current) {
      control.derivedState.clones.delete(previousDerivedState.current)
    }

    const derived = new RecordDerived(control.state, new Set())

    control.derivedState.clones.add(derived)

    previousDerivedState.current = derived

    return derived
  }, [control, props?.name])

  const proxy = useMemo(() => {
    return derivedState.createTrackingProxy(props?.name, props)
  }, [derivedState])

  useEffect(() => {
    return () => {
      if (previousDerivedState.current) {
        control.derivedState.clones.delete(previousDerivedState.current)
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
    [control, props?.disabled],
  )

  const getSnapshot = useCallback(() => {
    return derivedState.value
  }, [])

  const getServerSnapshot = useCallback(() => {
    return derivedState.value
  }, [])

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
