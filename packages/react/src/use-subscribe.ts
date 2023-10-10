import { RecordDerived } from '@forms.js/common/store'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { useCallback, useMemo, useSyncExternalStore } from 'react'

import type { ReactFormControl } from './form-control'
import { useFormControlContext } from './use-form-context'

export type UseSubscribeProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
> = {
  name: Extract<TName, string>
  formControl?: ReactFormControl<TValues>
}

export function useSubscribe<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
>(props: UseSubscribeProps<TValues, TName>) {
  const formControl = props.formControl ?? useFormControlContext<TValues>().formControl

  const derivedState = useMemo(
    () => new RecordDerived(formControl.state, new Set()),
    [formControl.state],
  )

  const proxy = useMemo(
    () => derivedState.createTrackingProxy(props.name, { exact: true }),
    [props.name],
  )

  const subscribe = useCallback(
    (callback: () => void) => {
      return derivedState.subscribe(() => {
        callback()
      })
    },
    [formControl],
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
