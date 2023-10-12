import { RecordDerived } from '@forms.js/common/store'
import { safeGet } from '@forms.js/core/utils/safe-get'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import type { Control } from './form-control'
import { useFormContext } from './use-form-context'

export type UseWatchProps<T extends Record<string, any> = Record<string, any>> = {
  name?: Extract<keyof FlattenObject<T>, string> | Extract<keyof FlattenObject<T>, string>[]
  exact?: boolean
  disabled?: boolean
  control?: Control<T>
  defaultValue?: any
}

export function useWatch<T extends Record<string, any>>(props?: UseWatchProps<T>) {
  const context = useFormContext<T>()

  const control = props?.control ?? context.control

  const derivedState = useMemo(() => {
    const derived = new RecordDerived(control.state, new Set())

    derived.track('values', props?.name, props)

    control.derivedState.clones.push(derived)

    return derived
  }, [control, props?.name])

  useEffect(() => {
    return () => {
      control.derivedState.clones = control.derivedState.clones.filter(
        (clone) => clone !== derivedState,
      )
    }
  }, [control, props?.name])

  const subscribe = useCallback(
    (callback: () => void) => {
      return derivedState.subscribe(
        () => {
          if (!props?.disabled) {
            callback()
          }
        },
        undefined,
        false,
      )
    },
    [control, props?.disabled],
  )

  const getSnapshot = useCallback(() => {
    return derivedState.value
  }, [])

  const getServerSnapshot = useCallback(() => {
    return derivedState.value
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const values = control.state.status.value.mount
    ? derivedState.proxy.values
    : props?.defaultValue == null
    ? control.state.defaultValues.value
    : typeof props?.name === 'string'
    ? { [props.name]: props?.defaultValue }
    : props?.defaultValue

  return props?.name
    ? Array.isArray(props.name)
      ? props.name.map((n) => safeGet(values, n))
      : safeGet(values, props.name) ?? props?.defaultValue
    : values
}
