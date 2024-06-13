// For some reason these types aren't portable??
import '@forms.js/core/utils/deep-partial'
import '@forms.js/core/utils/deep-map'

import type { ParseForm } from '@forms.js/core'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'

export type UseSubscribeProps<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
> = {
  name: TName
  control?: Control<TValues>
}

export function useSubscribe<
  TValues extends Record<string, any> = Record<string, any>,
  TName extends keyof ParseForm<TValues> = keyof ParseForm<TValues>,
>(props: UseSubscribeProps<TValues, TName>) {
  const { name } = props

  const context = useFormContext<TValues>()

  const control = props.control ?? context.control

  const state = useMemo(() => control.state.clone(), [control])

  state.keys?.add(props.name)

  const proxy = useMemo(() => state.createTrackingProxy(name, { exact: true }), [name])

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
