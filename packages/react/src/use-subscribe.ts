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

  const state = useMemo(() => control.state.clone(), [control])

  state.keys?.add(props.name)

  const proxy = useMemo(() => state.createTrackingProxy(props.name, { exact: true }), [props.name])

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
