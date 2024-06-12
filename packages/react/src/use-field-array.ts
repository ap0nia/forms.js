import '@forms.js/core/utils/nested-object-arrays'
import '@forms.js/core/utils/object-to-union'
import '@forms.js/core/utils/prettify'
import '@forms.js/core/utils/union-to-intersection'

import { get } from '@forms.js/common/utils/get'
import { set } from '@forms.js/common/utils/set'
import { FieldArray, type FieldArrayOptions, type ParseFieldArray } from '@forms.js/core'

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
      control.register(name as any, props.rules)
    }
  })

  useEffect(() => {
    const currentFieldArrayValue = get(control.state.value.values, name)

    if (!currentFieldArrayValue) {
      control.stores.values.update(
        (values) => {
          set(values, name, [])
          return values
        },
        [name],
      )
    }
  }, [control, name, shouldUnregister])

  useEffect(() => {
    /**
     * @todo name this a lifecycle hook...
     */
    fieldArray.current.doSomething()
  }, [fields, name, control])

  useEffect(() => {
    return () => {
      fieldArray.current.unmount()

      if (props.shouldUnregister || control.options.shouldUnregister) {
        control.unregister(props.name as any)
      }
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
