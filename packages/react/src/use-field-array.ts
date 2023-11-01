import { deepSet } from '@forms.js/common/utils/deep-set'
import { safeGet } from '@forms.js/common/utils/safe-get'
import { FieldArray, type FieldArrayOptions, type ParseFieldArray } from '@forms.js/core'
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import type { Control } from './control'
import { useFormContext } from './use-form-context'

export type UseFieldArrayProps<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedFieldArray extends ParseFieldArray<TValues> = ParseFieldArray<TValues>,
  TFieldArrayName extends TParsedFieldArray['keys'] = TParsedFieldArray['keys'],
> = Omit<
  FieldArrayOptions<TValues, TContext, TTransformedValues, TParsedFieldArray, TFieldArrayName>,
  'control'
> & {
  control?: Control<TValues, TContext, TTransformedValues>
}

export function useFieldArray<
  TValues extends Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedFieldArray extends ParseFieldArray<TValues> = ParseFieldArray<TValues>,
  TFieldArrayName extends TParsedFieldArray['keys'] = TParsedFieldArray['keys'],
>(
  props: UseFieldArrayProps<
    TValues,
    TContext,
    TTransformedValues,
    TParsedFieldArray,
    TFieldArrayName
  >,
) {
  const context = useFormContext<TValues, TContext, TTransformedValues>()

  const control = props.control ?? context.control

  const fieldArray = useRef(
    new FieldArray<TValues, TContext, TTransformedValues, TParsedFieldArray, TFieldArrayName>({
      ...props,
      control,
    }),
  )

  fieldArray.current.name = props.name

  const subscribe = useCallback(
    (callback: () => void) => fieldArray.current.fields.subscribe(callback, undefined, false),
    [fieldArray.current, props.name],
  )

  const getSnapshot = useCallback(() => fieldArray.current.fields.value, [fieldArray.current])

  const getServerSnapshot = useCallback(() => fieldArray.current.fields.value, [fieldArray.current])

  const fields = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    fieldArray.current.mount()

    if (props.rules) {
      control.register(props.name as any, props.rules)
    }
  })

  useEffect(() => {
    if (!safeGet(control.state.value.values, props.name)) {
      control.stores.values.update(
        (values) => {
          deepSet(values, props.name, [])
          return values
        },
        [props.name],
      )
    }
  }, [control, props.shouldUnregister])

  useEffect(() => {
    fieldArray.current.doSomething()
  }, [fields, props.name, props.shouldUnregister])

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
