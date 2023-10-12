import { RecordDerived } from '@forms.js/common/store'
import { safeGet } from '@forms.js/core/utils/safe-get'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react'

import type { Control } from './form-control'
import { useFormContext } from './use-form-context'

export type UseWatchProps<T extends Record<string, any> = Record<string, any>> = {
  defaultValue?: any
  disabled?: boolean
  name?: Extract<keyof FlattenObject<T>, string> | Extract<keyof FlattenObject<T>, string>[]
  control?: Control<T>
  exact?: boolean
}

export function useWatch<T extends Record<string, any>>(props?: UseWatchProps<T>) {
  const methods = useFormContext<T>()

  const { control = methods.control, name, ...options } = props || {}

  const _name = useRef(name)

  _name.current = name

  const derivedState = useMemo(() => {
    const d = new RecordDerived(control.state, new Set())
    d.track('values', props?.name, options)
    control.derivedState.clones.push(d)
    return d
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
    : typeof _name.current === 'string'
    ? { [_name.current]: props?.defaultValue }
    : props?.defaultValue

  return _name.current
    ? Array.isArray(_name.current)
      ? _name.current.map((n) => safeGet(values, n))
      : safeGet(values, _name.current) ?? props?.defaultValue
    : values
}
