import { RecordDerived } from '@forms.js/common/store'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { useCallback, useRef, useSyncExternalStore } from 'react'

import type { ReactFormControl } from './form-control'
import { useFormControlContext } from './use-form-context'

export type UseWatchProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
> = {
  name: Extract<TName, string>
  defaultValue?: FlattenObject<TValues>[TName]
  formControl?: ReactFormControl<TValues>
  exact?: boolean
  disabled?: boolean
}

export function useSubscribe<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
>(props: UseWatchProps<TValues, TName>) {
  const formControl = props.formControl ?? useFormControlContext<TValues>().formControl

  const derivedState = useRef(new RecordDerived(formControl.state, new Set()))

  const proxy = useRef(
    derivedState.current.createTrackingProxy(props.name, { ...props, exact: true }),
  )

  const subscribe = useCallback(
    (callback: () => void) => {
      return derivedState.current.subscribe(() => {
        callback()
      })
    },
    [formControl],
  )

  const getSnapshot = useCallback(() => {
    return derivedState.current.value
  }, [])

  const getServerSnapshot = useCallback(() => {
    return derivedState.current.value
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return proxy.current
}
