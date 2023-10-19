import { RecordDerived } from '@forms.js/common/store'
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

  const previousDerivedState = useRef<RecordDerived<Control<TValues>['state']>>()

  const derivedState = useMemo(() => {
    if (previousDerivedState.current) {
      control.derivedState.clones.delete(previousDerivedState.current)
    }

    const derived = new RecordDerived(control.state, new Set())

    control.derivedState.clones.add(derived)

    previousDerivedState.current = derived

    return derived
  }, [control])

  useEffect(() => {
    return () => {
      if (previousDerivedState.current) {
        control.derivedState.clones.delete(previousDerivedState.current)
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
