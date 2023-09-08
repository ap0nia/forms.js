import { VALIDATION_MODE } from '../constants'
import type { Field } from '../types/fields'
import type { UseFormGetValues, UseFormProps, UseFormRegister } from '../types/form'
import { deepSet } from '../utils/deep-set'
import { isObject } from '../utils/is-object'
import { safeGet } from '../utils/safe-get'
import { safeGetMultiple } from '../utils/safe-get-multiple'

const defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const

export function createFormControl<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TContext = any,
>(props: UseFormProps<TFieldValues, TContext> = {}, flushRootRender?: () => void) {
  const resolvedProps = {
    ...defaultOptions,
    ...props,
  }

  const defaultValues =
    isObject(resolvedProps.defaultValues) || isObject(resolvedProps.values)
      ? structuredClone(resolvedProps.defaultValues || resolvedProps.values) || {}
      : {}

  const fields = {}

  const value = resolvedProps.shouldUnregister ? {} : structuredClone(defaultValues)

  const getValues = ((fieldNames: any) => {
    return safeGetMultiple(value, fieldNames)
  }) as UseFormGetValues<TFieldValues>

  const register: UseFormRegister<TFieldValues> = (name, options = {}) => {
    const field = safeGet<Field>(value, name)

    const disabledIsDefined = typeof options.disabled === 'boolean'

    deepSet(fields, name, {
      ...(field || {}),
      _f: {
        ...(field && field._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    })

    return {
      disabledIsDefined,
    } as any
  }

  return {
    fields,
    props,
    getValues,
    flushRootRender,
    register,
  }
}
