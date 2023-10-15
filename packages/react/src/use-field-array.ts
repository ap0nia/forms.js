import { FieldArray, type FieldArrayOptions as UseFieldArrayProps } from '@forms.js/core'
import type { NestedObjectArrays } from '@forms.js/core/utils/types/nested-object-arrays'
import { useCallback, useRef, useSyncExternalStore } from 'react'

import { useFormContext } from './use-form-context'

export type { UseFieldArrayProps }

export function useFieldArray<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TFieldArray extends NestedObjectArrays<TValues> = NestedObjectArrays<TValues>,
  TFieldArrayName extends Extract<keyof TFieldArray, string> = Extract<keyof TFieldArray, string>,
>(props: UseFieldArrayProps<TValues, TContext, TTransformedValues, TFieldArray, TFieldArrayName>) {
  const context = useFormContext()

  const name = props.name
  const control = props.control ?? context.control

  const fieldArray = useRef(
    new FieldArray<TValues, TContext, TTransformedValues, TFieldArray, TFieldArrayName>({
      name,
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
