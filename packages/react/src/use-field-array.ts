import '@hookform/core/utils/nested-object-arrays'
import '@hookform/core/utils/object-to-union'
import '@hookform/core/utils/prettify'
import '@hookform/core/utils/union-to-intersection'

import { get } from '@hookform/common/utils/get'
import { set } from '@hookform/common/utils/set'
import { FieldArray, type FieldArrayOptions, type ParseFieldArray } from '@hookform/core'
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'

export type UseFieldArrayProps<
  TFieldValues extends Record<string, any>,
  TFieldArrayName extends keyof ParseFieldArray<TFieldValues> = keyof ParseFieldArray<TFieldValues>,
  TKeyName extends string = 'id',
> = Omit<FieldArrayOptions<TFieldValues, TFieldArrayName, TKeyName>, 'control'> & {
  control?: Control<TFieldValues>
}

export function useFieldArray<
  TFieldValues extends Record<string, any>,
  TFieldArrayName extends keyof ParseFieldArray<TFieldValues> = keyof ParseFieldArray<TFieldValues>,
  TKeyName extends string = 'id',
>(props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>) {
  const { name, shouldUnregister } = props

  const context = useFormContext<TFieldValues>()

  const control = props.control ?? context?.control

  const fieldArray = useRef(
    new FieldArray<TFieldValues, TFieldArrayName, TKeyName>({
      ...props,
      control,
    }),
  )

  fieldArray.current.name = name

  const subscribe = useCallback(
    (callback: () => void) => fieldArray.current.fields.subscribe(callback, undefined, false),
    [fieldArray.current, name],
  )

  const getSnapshot = useCallback(() => fieldArray.current.fields.value, [fieldArray.current])

  const getServerSnapshot = useCallback(() => fieldArray.current.fields.value, [fieldArray.current])

  const fields = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    fieldArray.current.mount()

    if (props.rules) {
      control.register(name, props.rules)
    }
  })

  useEffect(() => {
    const currentFieldArrayValue = get(control._formValues, name)

    if (!currentFieldArrayValue) {
      control.stores.values.update((values: any) => {
        set(values, name, [])
        return values
      }, name)
    }

    return () => {
      fieldArray.current.unmount()

      if (shouldUnregister || control.options.shouldUnregister) {
        control.unregister(name)
      }
    }
  }, [control, name, shouldUnregister])

  useEffect(() => {
    fieldArray.current.synchronize()
  }, [fields, name, control])

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
