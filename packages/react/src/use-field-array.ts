import { FieldArray, type FieldArrayOptions } from '@forms.js/core'
import type { NestedObjectArrays } from '@forms.js/core/utils/types/nested-object-arrays'
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

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

  const subscribe = useCallback(
    (callback: () => void) => {
      return fieldArray.current.fields.subscribe(callback)
    },
    [fieldArray.current],
  )

  const getSnapshot = useCallback(() => {
    return fieldArray.current.fields.value
  }, [fieldArray.current])

  const getServerSnapshot = useCallback(() => {
    return fieldArray.current.fields.value
  }, [fieldArray.current])

  const fields = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  fieldArray.current.mount()

  useEffect(() => {
    return () => {
      fieldArray.current.unmount()
    }
  }, [fieldArray.current])

  return {
    fields,
    swap: fieldArray.current.swap.bind(fieldArray.current),
    move: fieldArray.current.move.bind(fieldArray.current),
    prepend: fieldArray.current.prepend.bind(fieldArray.current),
    append: fieldArray.current.append.bind(fieldArray.current),
    remove: fieldArray.current.remove.bind(fieldArray.current),
    insert: fieldArray.current.insert.bind(fieldArray.current),
    update: fieldArray.current.update.bind(fieldArray.current),
    replace: fieldArray.current.replace.bind(fieldArray.current),
  }
}
