import { VALIDATION_MODE } from '../constants'
import type { Field } from '../types/fields'
import type { Names, UseFormGetValues, UseFormProps, UseFormRegister } from '../types/form'
import { deepSet } from '../utils/deep-set'
import { isObject } from '../utils/is-object'
import { safeGet } from '../utils/safe-get'
import { safeGetMultiple } from '../utils/safe-get-multiple'

const defaultProps = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const

export class FormControl<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TContext = any,
> {
  names: Names

  props: UseFormProps<TFieldValues, TContext>

  defaultValues: any

  values: any

  fields: any

  flushRootRender?: () => void

  constructor(props: UseFormProps<TFieldValues, TContext> = {}, flushRootRender?: () => void) {
    const resolvedProps = {
      ...defaultProps,
      ...props,
    }

    this.props = resolvedProps

    this.defaultValues =
      isObject(resolvedProps.defaultValues) || isObject(resolvedProps.values)
        ? structuredClone(resolvedProps.defaultValues || resolvedProps.values) || {}
        : {}

    this.names = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
      watch: new Set(),
    }

    this.fields = {}

    this.flushRootRender = flushRootRender
  }

  getValues: UseFormGetValues<TFieldValues> = (fieldNames: any) => {
    return safeGetMultiple(this.getValues, fieldNames)
  }

  register: UseFormRegister<TFieldValues> = (name, options = {}) => {
    const field = safeGet<Field | undefined>(this.fields, name)

    const disabledIsDefined = typeof options.disabled === 'boolean'

    deepSet(this.fields, name, {
      ...field,
      _f: {
        ...(field?._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    })

    this.names.mount.add('' + name)

    return { disabledIsDefined } as any
  }
}
