import { Batchable } from '@forms.js/common/store'
import type { FormFieldNames } from '@forms.js/core'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

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
  const context = useFormContext<TValues>()

  const control = props.control ?? context.control

  const derivedState = useMemo(() => {
    const derived = new Batchable(control.stores, new Set())

    control.state.children.add(derived)

    return derived
  }, [control])

  derivedState.keys?.add(props.name)

  useEffect(() => {
    return () => {
      control.state.children.delete(derivedState)
    }
  }, [control, derivedState])

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
    return derivedState.writable.value
  }, [])

  const getServerSnapshot = useCallback(() => {
    return derivedState.writable.value
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return proxy
}
