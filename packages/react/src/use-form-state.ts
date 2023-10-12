import { RecordDerived } from '@forms.js/common/store'
import type { FormControlState } from '@forms.js/core'
import type { FlattenObject } from '@forms.js/core/utils/types/flatten-object'
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import type { Control } from './form-control'
import { useFormControlContext } from './use-form-context'

export type UseFormStateProps<T extends Record<string, any> = Record<string, any>> = {
  control?: Control<T>
  name?: Extract<keyof FlattenObject<T>, string> | Extract<keyof FlattenObject<T>, string>[]
  disabled?: boolean
  exact?: boolean
}

export function useFormState<T extends Record<string, any>>(
  props?: UseFormStateProps<T>,
): FormControlState<T> {
  const context = useFormControlContext<T>()

  const control = props?.control ?? context.control

  const mounted = useRef(false)

  const derivedState = useMemo(() => {
    const d = new RecordDerived(control.state, new Set())
    d.createTrackingProxy(props?.name, props)
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

  useEffect(() => {
    mounted.current = true

    if (derivedState.proxy.isValid) {
      control.updateValid(true)
    }

    return () => {
      mounted.current = false
    }
  }, [control])

  return derivedState.proxy
}
