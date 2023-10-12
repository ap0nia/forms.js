import { RecordDerived } from '@forms.js/common/store'
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
    const hi = new RecordDerived(control.state, new Set())
    hi.track('values', props?.name, options)
    control.derivedState.clones.push(hi)
    return hi
  }, [control, props?.name])

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

  return _name.current
    ? Array.isArray(_name.current)
      ? _name.current.map((n) => derivedState.proxy.values?.[n] ?? props?.defaultValue?.[n])
      : derivedState.proxy.values[_name.current] ??
        props?.defaultValue ??
        control.state.defaultValues.value[_name.current]
    : derivedState.proxy.values
}
