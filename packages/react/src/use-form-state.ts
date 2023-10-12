import { FormControl, type FormControlState } from '@forms.js/core'
import type { FlattenObject } from 'packages/core/src/utils/types/flatten-object'
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

import { useFormControlContext } from './use-form-context'

export type UseFormStateProps<T extends Record<string, any> = Record<string, any>> = {
  formControl?: FormControl<T>
  disabled?: boolean
  name?: Extract<keyof FlattenObject<T>, string> | Extract<keyof FlattenObject<T>, string>[]
  exact?: boolean
}

export function useFormState<T extends Record<string, any>>(
  props?: UseFormStateProps<T>,
): FormControlState<T> {
  const formControl = (props?.formControl ?? useFormControlContext().control) as FormControl<T>

  const proxy = useRef<FormControlState<T>>(
    props?.name
      ? formControl.derivedState.createTrackingProxy(props.name)
      : formControl.derivedState.proxy,
  )

  const subscribe = useCallback(
    (callback: () => void) => {
      return formControl.derivedState.subscribe(() => {
        callback()
      })
    },
    [formControl],
  )

  const getSnapshot = useCallback(() => {
    return proxy.current
  }, [])

  const getServerSnapshot = useCallback(() => {
    return proxy.current
  }, [])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    proxy.current = props?.name
      ? formControl.derivedState.createTrackingProxy(props.name)
      : formControl.derivedState.proxy
  }, [formControl, props?.name])

  return proxy.current
}
