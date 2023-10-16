import { FieldArray, type FieldArrayOptions } from '@forms.js/core'
import { deepSet } from '@forms.js/core/utils/deep-set'
import { safeGet } from '@forms.js/core/utils/safe-get'
import type { NestedObjectArrays } from '@forms.js/core/utils/types/nested-object-arrays'
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import type { Control } from './form-control'
import { useFormContext } from './use-form-context'

export type UseFieldArrayProps<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TFieldArray extends NestedObjectArrays<TValues> = NestedObjectArrays<TValues>,
  TFieldArrayName extends Extract<keyof TFieldArray, string> = Extract<keyof TFieldArray, string>,
> = Omit<
  FieldArrayOptions<TValues, TContext, TTransformedValues, TFieldArray, TFieldArrayName>,
  'control'
> & {
  control?: Control<TValues, TContext, TTransformedValues>
}

export function useFieldArray<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TFieldArray extends NestedObjectArrays<TValues> = NestedObjectArrays<TValues>,
  TFieldArrayName extends Extract<keyof TFieldArray, string> = Extract<keyof TFieldArray, string>,
>(props: UseFieldArrayProps<TValues, TContext, TTransformedValues, TFieldArray, TFieldArrayName>) {
  const context = useFormContext<TValues, TContext, TTransformedValues>()

  const control = props.control ?? context.control

  const fieldArray = useRef(
    new FieldArray<TValues, TContext, TTransformedValues, TFieldArray, TFieldArrayName>({
      ...props,
      control,
    }),
  )

  useEffect(() => {
    if (fieldArray.current.name !== props.name) {
      fieldArray.current = new FieldArray<
        TValues,
        TContext,
        TTransformedValues,
        TFieldArray,
        TFieldArrayName
      >({
        ...props,
        control,
      })
    }
  }, [props.name])

  const subscribe = useCallback(
    (callback: () => void) => {
      return fieldArray.current.fields.subscribe(callback, undefined, false)
    },
    [fieldArray.current, props.name],
  )

  const getSnapshot = useCallback(() => {
    return fieldArray.current.fields.value
  }, [fieldArray.current])

  const getServerSnapshot = useCallback(() => {
    return fieldArray.current.fields.value
  }, [fieldArray.current])

  const fields = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    fieldArray.current.mount()
    if (props.rules) {
      control.register(props.name as any, props.rules)
    }
  })

  useEffect(() => {
    if (!safeGet(control.state.values.value, props.name)) {
      control.state.values.update((values) => {
        deepSet(values, props.name, [])
        return values
      })
    }
  }, [control, props.shouldUnregister])

  useEffect(() => {
    const unsubscribe = fieldArray.current.createSubscription()

    return () => {
      fieldArray.current.unmount()
      unsubscribe()
    }
  }, [fieldArray.current])

  const fieldArrayMethods = useMemo(() => {
    return {
      swap: fieldArray.current.swap.bind(fieldArray.current),
      move: fieldArray.current.move.bind(fieldArray.current),
      prepend: fieldArray.current.prepend.bind(fieldArray.current),
      append: fieldArray.current.append.bind(fieldArray.current),
      remove: fieldArray.current.remove.bind(fieldArray.current),
      insert: fieldArray.current.insert.bind(fieldArray.current),
      update: fieldArray.current.update.bind(fieldArray.current),
      replace: fieldArray.current.replace.bind(fieldArray.current),
    }
  }, [fieldArray.current])

  return { fields, ...fieldArrayMethods, fieldArray: fieldArray.current }
}
