import { RecordDerived } from '@forms.js/common/store'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import type { ReactFormControl } from './form-control'
import { useFormControlContext } from './use-form-context'

export type UseSubscribeProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
> = {
  name: Extract<TName, string>
  control?: ReactFormControl<TValues>
}

export function useSubscribe<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
>(props: UseSubscribeProps<TValues, TName>) {
  const control = props.control ?? useFormControlContext<TValues>().control

  const derivedState = useMemo(() => {
    const derived = new RecordDerived(control.state, new Set())

    control.derivedState.clones.push(derived)

    return derived
  }, [control])

  useEffect(() => {
    return () => {
      control.derivedState.clones = control.derivedState.clones.filter(
        (clone) => clone !== derivedState,
      )
    }
  }, [control, props?.name])

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
