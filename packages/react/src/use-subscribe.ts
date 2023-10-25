import { Batchable } from '@forms.js/common/store'
import type { FormFieldNames } from '@forms.js/core'
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'

export type UseSubscribeProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends FormFieldNames<TValues> = FormFieldNames<TValues>,
> = {
  name: Extract<TName, string>
  control?: Control<TValues>
}

export function useSubscribe<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends FormFieldNames<TValues> = FormFieldNames<TValues>,
>(props: UseSubscribeProps<TValues, TName>) {
  const control = props.control ?? useFormContext<TValues>().control

  const previousDerivedState = useRef<Batchable<Control<TValues>['state']>>()

  const derivedState = useMemo(() => {
    if (previousDerivedState.current) {
      control.batchedState.children.delete(previousDerivedState.current)
    }

    const derived = new Batchable(control.state, new Set())

    control.batchedState.children.add(derived)

    previousDerivedState.current = derived

    return derived
  }, [control])

  useEffect(() => {
    return () => {
      if (previousDerivedState.current) {
        control.batchedState.children.delete(previousDerivedState.current)
        previousDerivedState.current = undefined
      }
    }
  }, [])

  const proxy = useMemo(
    () => derivedState.createTrackingProxy(props.name, { exact: true }),
    [props.name],
  )

  const subscribe = useCallback(
    (callback: () => void) => {
      return derivedState.subscribe(
        () => {
          callback()
        },
        undefined,
        false,
      )
    },
    [control],
  )

  const getSnapshot = useCallback(() => {
    return derivedState.value
  }, [])

  const getServerSnapshot = useCallback(() => {
    return derivedState.value
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return proxy
}
