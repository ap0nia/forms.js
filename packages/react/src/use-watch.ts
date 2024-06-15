import type { ParseForm } from '@hookform/core'
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

export function useWatch<T extends Record<string, any>>(props: UseWatchProps<T> = {}) {
  const { name, defaultValue, disabled, exact } = props

  const context = useFormContext<T>()

  const control = props?.control ?? context.control

  const state = useMemo(() => {
    const child = control.state.clone()

    child.track('values', name, { exact })

    return child
  }, [control, name, exact])

  const subscribe = useCallback(
    (callback: () => void) => {
      return state.subscribe(() => !disabled && callback(), undefined, false)
    },
    [state, disabled],
  )

  const getSnapshot = useCallback(() => state.value, [state])

  const getServerSnapshot = useCallback(() => state.value, [state])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    return () => {
      control.state.children.delete(state)
    }
  }, [control, state])

  return control.getWatch(name, defaultValue)
}
