import { observable } from '@legendapp/state'

import {
  type ValidationMode,
  type RevalidationMode,
  type CriteriaMode,
  VALIDATION_MODE,
} from './constants'
import type { FieldError, FieldErrors } from './errors'
import type { Field, FieldName, FieldRefs } from './field'
import { isBoolean } from './guards/is-boolean'
import { isEmptyObject } from './guards/is-empty-object'
import { isFunction, type AnyFunction } from './guards/is-function'
import { isNullish } from './guards/is-nullish'
import { isObject } from './guards/is-object'
import { getResolverOptions } from './logic/get-resolver-options'
import type { Resolver } from './resolver'
import { updateFieldArrayRootError } from './update-field-array-root-error'
import type { AnyRecord } from './utils/any-record'
import { deepEqual } from './utils/deep-equal'
import { deepGet } from './utils/deep-get'
import type { DeepMapObject } from './utils/deep-map-object'
import type { DeepPartial } from './utils/deep-partial'
import { deepSet } from './utils/deep-set'
import { deepUnset } from './utils/deep-unset'
import type { FlattenObject } from './utils/flatten-object'
import { live } from './utils/live'
import type { MaybeAsyncFunction } from './utils/maybe-async-function'
import validateField from './validateField'
import type { RegisterOptions } from './validator'

/**
 * What to do when transitioning between states?
 */
export type KeepStateOptions = {
  /**
   * Whether to keep the form's current values that are dirty.
   */
  keepDirtyValues?: boolean

  /**
   * Whether to keep errors.
   */
  keepErrors?: boolean

  /**
   * Whether to keep the form marked as dirty.
   */
  keepDirty?: boolean

  /**
   * Whether to keep the form's current values.
   */
  keepValues?: boolean

  /**
   * Whether to keep the same default values.
   */
  keepDefaultValues?: boolean

  /**
   * Whether to keep the submission status.
   */
  keepIsSubmitted?: boolean

  /**
   * Whether to keep the touched status.
   */
  keepTouched?: boolean

  /**
   * Whether to keep the form's current validation status.
   */
  keepIsValid?: boolean

  /**
   * Whether to keep the form's current submit count.
   */
  keepSubmitCount?: boolean
}

export type UseFormProps<TForm extends AnyRecord = AnyRecord, TContext = any> = {
  /**
   * When to validate the form.
   */
  mode?: keyof ValidationMode

  /**
   * When to revalidate the form?
   */
  revalidationMode?: RevalidationMode

  /**
   * Default values assigned to the form when the corresponding field is undefined.
   *
   * @remarks only takes effect on mount and when resetting?
   */
  defaultValues?: DeepPartial<TForm> | MaybeAsyncFunction<DeepPartial<TForm>>

  /**
   * The current form values.
   */
  values?: TForm

  /**
   * What to do when resetting the form.
   */
  resetOptions?: KeepStateOptions

  /**
   * Validates the form.
   */
  resolver?: Resolver<TForm, TContext>

  /**
   * Idk what context is for.
   */
  context?: TContext

  /**
   * Whether to focus the specific field when it has an error.
   *
   * @default true
   */
  shouldFocusError?: boolean

  /**
   * Idk.
   */
  shouldUnregister?: boolean

  /**
   * Idk.
   */
  shouldUseNativeValidation?: boolean

  /**
   * Idk.
   */
  progressive?: boolean

  /**
   * Idk.
   */
  criteriaMode?: CriteriaMode

  /**
   * Idk.
   */
  delayError?: number
}

export type FormState<T> = {
  isDirty: boolean
  isLoading: boolean
  isSubmitted: boolean
  isSubmitSuccessful: boolean
  isSubmitting: boolean
  isValidating: boolean
  isValid: boolean
  submitCount: number
  defaultValues?: Readonly<DeepPartial<T>>
  dirtyFields: Partial<Readonly<DeepMapObject<T, boolean>>>
  touchedFields: Partial<Readonly<DeepMapObject<T, boolean>>>
  errors: FieldErrors<T>
}

export type Names = {
  mount: Set<string>
  unMount: Set<string>
  array: Set<string>
  watch: Set<string>
  focus?: Set<string>
  watchAll?: Set<boolean>
}

/**
 * A delayed function accepts a duration and is expected to execute after the duration.
 */
export type DelayedFunction = (duration: number) => unknown

/**
 */
export function useForm<TForm extends AnyRecord = AnyRecord, TContext = any>(
  props: UseFormProps<TForm, TContext>,
) {
  createFormControl<TForm, TContext>(props)
}

const defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const

export function createFormControl<
  TForm extends AnyRecord = AnyRecord,
  TContext = any,
  TFlattenedForm = FieldName<TForm>,
>(props: UseFormProps<TForm, TContext>) {
  const _options = {
    ...defaultOptions,
    ...props,
  }

  const _formState: FormState<TForm> = {
    submitCount: 0,
    isDirty: false,
    isLoading: isFunction(_options.defaultValues),
    isValidating: false,
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    touchedFields: {},
    dirtyFields: {},
    errors: {},
  }

  const _fields = {}

  const _defaultValues =
    isObject(_options.defaultValues) || isObject(_options.values)
      ? structuredClone(_options.defaultValues ?? _options.values ?? {})
      : {}

  const _formValues = _options.shouldUnregister ? {} : structuredClone(_defaultValues)

  const _state = {
    action: false,
    mount: false,
    watch: false,
  }

  const _names: Names = {
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
  }

  const delayErrorCallback: DelayedFunction | null = null

  let timer = 0

  const _proxyFormState = {
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  }

  const _subjects = {
    values: observable(),
    array: observable(),
    state: observable(),
  }

  // const shouldCaptureDirtyFields = props.resetOptions && props.resetOptions.keepDirtyValues
  // const validationModeBeforeSubmit = getValidationModes(_options.mode)
  // const validationModeAfterSubmit = getValidationModes(_options.reValidateMode)
  const shouldDisplayAllAssociatedErrors = _options.criteriaMode === VALIDATION_MODE.all

  const debounce = <T extends AnyFunction>(callback: T) => {
    const waitFunction: DelayedFunction = (wait) => {
      clearTimeout(timer)
      timer = setTimeout(callback, wait)
    }
    return waitFunction
  }

  const _updateValid = async (shouldUpdateValid?: boolean) => {
    if (_proxyFormState.isValid || shouldUpdateValid) {
      const isValid = _options.resolver
        ? isEmptyObject((await _executeSchema())?.errors)
        : await executeBuiltInValidation(_fields, true)

      if (isValid !== _formState.isValid) {
        _subjects.state.set({ isValid })
      }
    }
  }

  const executeBuiltInValidation = async (
    fields: FieldRefs<TForm>,
    shouldOnlyCheckValid?: boolean,
    context = { valid: true },
  ) => {
    for (const name in fields) {
      const field = fields[name as keyof typeof fields]

      if (field == null) {
        continue
      }

      const { _f, ...fieldValue } = field

      if (_f) {
        const isFieldArrayRoot = _names.array.has(_f.name)

        const fieldError = await validateField(
          field,
          _formValues,
          shouldDisplayAllAssociatedErrors,
          _options.shouldUseNativeValidation && !shouldOnlyCheckValid,
          isFieldArrayRoot,
        )

        if (fieldError[_f.name]) {
          context.valid = false

          if (shouldOnlyCheckValid) {
            break
          }
        }

        if (shouldOnlyCheckValid) {
          continue
        }

        if (deepGet(fieldError, _f.name)) {
          if (isFieldArrayRoot) {
            updateFieldArrayRootError(_formState.errors, fieldError, _f.name)
          } else {
            deepSet(_formState.errors, _f.name, fieldError[_f.name])
          }
        } else {
          deepUnset(_formState.errors, _f.name)
        }
      }

      if (fieldValue) {
        await executeBuiltInValidation(fieldValue as any, shouldOnlyCheckValid, context)
      }
    }

    return context.valid
  }

  const _updateIsValidating = (value: boolean) => {
    if (_proxyFormState.isValidating) {
      _subjects.state.set({ isValidating: value })
    }
  }

  /**
   * TODO
   */
  const _updateFieldArray = () => {}

  const updateErrors = (name: string, error: FieldError) => {
    deepSet(_formState.errors, name, error)
    _subjects.state.set({ errors: _formState.errors })
  }

  const _executeSchema = async (name?: string[]) => {
    if (_options.resolver == null) {
      return
    }

    const resolverOptions = getResolverOptions(
      name || _names.mount,
      _fields,
      _options.criteriaMode,
      _options.shouldUseNativeValidation,
    )

    return _options.resolver(_formValues as TForm, _options.context, resolverOptions)
  }

  const executeSchemaAndUpdateState = async (names?: string[]) => {
    const schemaResult = await _executeSchema(names)

    if (schemaResult == null) {
      return
    }

    if (names) {
      for (const name of names) {
        const error = deepGet(schemaResult.errors, name)
        error ? deepSet(_formState.errors, name, error) : deepUnset(_formState.errors, name)
      }
    } else {
      _formState.errors = schemaResult.errors
    }

    return schemaResult.errors
  }

  const _removeUnmounted = () => {
    for (const name of _names.unMount) {
      const field = deepGet<Field | undefined>(_fields, name)

      if (!live(field?._f.ref) || field?._f.refs?.every((ref) => !live(ref))) {
        unregister(name as keyof TFlattenedForm)
      }
    }

    _names.unMount = new Set()
  }

  const _getDirty: GetIsDirty = (name, data) => {
    if (name && data) {
      deepSet(_formValues, name, data)
      return !deepEqual(getValues(), _defaultValues)
    }
    return false
  }

  const getValues = ((fieldNames?: keyof TFlattenedForm | keyof TFlattenedForm[]) => {
    const values = {
      ..._defaultValues,
      ...(_state.mount ? _formValues : {}),
    }

    if (fieldNames == null) {
      return values
    }

    if (Array.isArray(fieldNames)) {
      return fieldNames.map((name) => deepGet(values, name))
    }

    return deepGet(values, fieldNames)
  }) as UseFormGetValues<TForm>

  // const register: UseFormRegister<TForm> = (name, options = {}) => {
  const register = <TFieldName extends keyof TFlattenedForm>(
    name: TFieldName,
    options: any, // RegisterOptions<TFlattenedForm, TFieldName> = {},
  ) => {
    let field = deepGet(_fields, name)
    const disabledIsDefined = isBoolean(options.disabled)

    deepSet(_fields, name, {
      ...(field || {}),
      _f: {
        ...(field && field._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    })

    _names.mount.add(name)

    if (field) {
      _updateDisabledField({
        field,
        disabled: options.disabled,
        name,
      })
    } else {
      updateValidAndValue(name, true, options.value)
    }

    return {
      ...(disabledIsDefined ? { disabled: options.disabled } : {}),
      ...(_options.progressive
        ? {
            required: !!options.required,
            min: getRuleValue(options.min),
            max: getRuleValue(options.max),
            minLength: getRuleValue<number>(options.minLength) as number,
            maxLength: getRuleValue(options.maxLength) as number,
            pattern: getRuleValue(options.pattern) as string,
          }
        : {}),
      name,
      onChange,
      onBlur: onChange,
      ref: (ref: HTMLInputElement | null): void => {
        if (ref == null) {
          field = get(_fields, name, {})

          if (field._f) {
            field._f.mount = false
          }

          if (
            (_options.shouldUnregister || options.shouldUnregister) &&
            !(isNameInFieldArray(_names.array, name) && _state.action)
          ) {
            _names.unMount.add(name)
          }
          return
        }

        register(name, options)

        field = deepGet(_fields, name)

        const fieldRef = isNullish(ref.value)
          ? ref.querySelectorAll
            ? (ref.querySelectorAll('input,select,textarea')[0] as Ref) || ref
            : ref
          : ref

        const radioOrCheckbox = isRadioOrCheckbox(fieldRef)

        const refs = field._f.refs || []

        if (
          radioOrCheckbox
            ? refs.find((option: Ref) => option === fieldRef)
            : fieldRef === field._f.ref
        ) {
          return
        }

        deepSet(_fields, name, {
          _f: {
            ...field._f,
            ...(radioOrCheckbox
              ? {
                  refs: [
                    ...refs.filter(live),
                    fieldRef,
                    ...(Array.isArray(get(_defaultValues, name)) ? [{}] : []),
                  ],
                  ref: { type: fieldRef.type, name },
                }
              : { ref: fieldRef }),
          },
        })

        updateValidAndValue(name, false, undefined, fieldRef)
      },
    }
  }

  return {
    getValues,
    register,
    delayErrorCallback,
    debounce,
    updateErrors,
    executeBuiltInValidation,
    executeSchemaAndUpdateState,
    _getDirty,
    _removeUnmounted,
    _updateValid,
    _updateFieldArray,
    _updateIsValidating,
  }
}

export type UseFormGetValues<T> = {
  /**
   * Get the entire form values when no argument is supplied to this function.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @returns form values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues()}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: (value, formValues) => formValues.otherField === value;
   * })} />
   * ```
   */
  (): T

  /**
   * Get a single field value.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param name - the path name to the form field value.
   *
   * @returns the single field value
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues("name")}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues('otherField') === "test";
   * })} />
   * ```
   */
  <TFieldName extends FieldName<T>>(name: TFieldName): any
  /**
   * Get an array of field values.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param names - an array of field names
   *
   * @returns An array of field values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues(["name", "name1"])}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues(["fieldA", "fieldB"]).includes("test");
   * })} />
   * ```
   */
  <TFieldNames extends FieldName<T>[]>(names: readonly [...TFieldNames]): any
}

export type GetIsDirty = <T>(name?: string, data?: T) => boolean

/**
 * Register field into hook form with or without the actual DOM ref. You can invoke register anywhere in the component including at `useEffect`.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useform/register) • [Demo](https://codesandbox.io/s/react-hook-form-register-ts-ip2j3) • [Video](https://www.youtube.com/watch?v=JFIpCoajYkA)
 *
 * @param name - the path name to the form field value, name is required and unique
 * @param options - register options include validation, disabled, unregister, value as and dependent validation
 *
 * @returns onChange, onBlur, name, ref, and native contribute attribute if browser validation is enabled.
 *
 * @example
 * ```tsx
 * // Register HTML native input
 * <input {...register("input")} />
 * <select {...register("select")} />
 *
 * // Register options
 * <textarea {...register("textarea", { required: "This is required.", maxLength: 20 })} />
 * <input type="number" {...register("name2", { valueAsNumber: true })} />
 * <input {...register("name3", { deps: ["name2"] })} />
 *
 * // Register custom field at useEffect
 * useEffect(() => {
 *   register("name4");
 *   register("name5", { value: '"hiddenValue" });
 * }, [register])
 *
 * // Register without ref
 * const { onChange, onBlur, name } = register("name6")
 * <input onChange={onChange} onBlur={onBlur} name={name} />
 * ```
 */
export type UseFormRegister<T extends AnyRecord> = <
  TFieldName extends keyof FlattenObject<T> = keyof FlattenObject<T>,
>(
  name: TFieldName,
  options?: RegisterOptions<T, TFieldName>,
) => UseFormRegisterReturn<TFieldName>
