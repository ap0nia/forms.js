import type { ParseForm } from '@forms.js/core'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'

export type UseWatchProps<T extends Record<string, any> = Record<string, any>> = {
  name?: keyof ParseForm<T> | (keyof ParseForm<T>)[]
  exact?: boolean
  disabled?: boolean
  control?: Control<T>
  defaultValue?: any
}

export function useWatch<T extends Record<string, any>>(props?: UseWatchProps<T>) {
  const context = useFormContext<T>()

  const control = props?.control ?? context.control

  const state = useMemo(() => control.state.clone(), [control])

  state.track('values', props?.name, props)

  const subscribe = useCallback(
    (callback: () => void) => {
      return state.subscribe(() => !props?.disabled && callback(), undefined, false)
    },
    [state, props?.disabled],
  )

  const getSnapshot = useCallback(() => state.value, [state])

  const getServerSnapshot = useCallback(() => state.value, [state])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    return () => {
      control.state.children.delete(state)
    }
  }, [control, state])

  // if (props?.name == null) {
  //   return control.watch()
  // }

  return control.getWatch(props?.name, props?.defaultValue)
}
