// For some reason these types aren't portable??
import '@hookform/core/utils/deep-partial'
import '@hookform/core/utils/deep-map'

import type { ParseForm } from '@hookform/core'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'

export type UseSubscribeProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
> = {
  name: TName
  control?: Control<TValues>

  /**
   * Whether to listen to an exact match for the field name.
   */
  exact?: boolean | 'name' | 'context'
}

export function useSubscribe<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
>(props: UseSubscribeProps<TValues, TName>) {
  const { name, exact } = props

  const context = useFormContext<TValues>()

  const control = props.control ?? context.control

  const state = useMemo(() => {
    const child = control.state.clone()

    child.keys.add(name)

    return child
  }, [control, name])

  const proxy = useMemo(() => {
    return state.createTrackingProxy(name, { exact })
  }, [name])

  const subscribe = useCallback(
    (callback: () => void) => state.subscribe(callback, undefined, false),
    [state],
  )

  const getSnapshot = useCallback(() => state.value, [state])

  const getServerSnapshot = useCallback(() => state.value, [state])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    return () => {
      control.state.children.delete(state)
    }
  }, [control, state])

  return proxy
}
