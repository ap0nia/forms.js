import type { Observable } from '@legendapp/state'

import type { CriteriaMode, Mode, RevalidationMode } from '../constants'
import type { DeepPartial } from '../type-utils/deep-partial'
import type { FlattenObject } from '../type-utils/flatten-object'

import type { FieldErrors } from './errors'
import type { EventType } from './event'
import type {
  Field,
  FieldName,
  FieldPath,
  FieldRefs,
  FieldValues,
  InternalFieldName,
} from './fields'
import type { DeepMap, Nullish } from './utils'
import type { RegisterOptions } from './validator'

export type DefaultValues<TFieldValues> = TFieldValues extends AsyncDefaultValues<TFieldValues>
  ? DeepPartial<Awaited<TFieldValues>>
  : DeepPartial<TFieldValues>

export type AsyncDefaultValues<T> = (payload?: unknown) => Promise<T>

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

export type UseFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
  mode?: Mode

  revalidateMode?: RevalidationMode

  defaultValues?: DefaultValues<TFieldValues> | AsyncDefaultValues<TFieldValues>

  values?: TFieldValues

  resetOptions?: KeepStateOptions

  resolver?: any

  context?: TContext

  shouldFocusError?: boolean

  shouldUnregister?: boolean

  shouldUseNativeValidation?: boolean

  progressive?: boolean

  criteriaMode?: CriteriaMode

  delayError?: number
}

export type UseFormGetValues<T extends FieldValues> = {
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
  (nullish?: Nullish): T

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
  <TFieldName extends FieldName<T>>(name: TFieldName): FlattenObject<T>[TFieldName]
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
  <TFieldNames extends FieldName<T>[]>(
    names: readonly [...TFieldNames],
  ): RecordKeyMapper<FlattenObject<T>, TFieldNames>
}

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
export type UseFormRegister<T extends FieldValues> = <
  TFieldName extends FieldName<T> = FieldName<T>,
>(
  name: TFieldName,
  options?: RegisterOptions<T, TFieldName>,
) => UseFormRegisterReturn<TFieldName>

export type ChangeHandler = (event: { target: any; type?: any }) => Promise<void | boolean>

export type RefCallBack = (instance: any) => void

/**
 * Returned registration props.
 */
export type UseFormRegisterReturn<T = InternalFieldName> = {
  onChange: ChangeHandler
  onBlur: ChangeHandler
  ref: RefCallBack
  name: T
  min?: string | number
  max?: string | number
  maxLength?: number
  minLength?: number
  pattern?: string
  required?: boolean
  disabled?: boolean
}

/**
 * TODO: move this somewhere else.
 *
 * Given a tuple of keys belonging to an object, return a tuple with the values at each key.
 *
 * This type ***does not*** enforce that the provided tuple only has valid keys of the object.
 * Any invalid keys will be mapped to `never`.
 */
export type RecordKeyMapper<
  T extends Record<string, any>,
  Keys extends unknown[],
  Answer extends unknown[] = [],
> = Keys extends []
  ? Answer
  : Keys extends [infer Head, ...infer Tail]
  ? RecordKeyMapper<T, Tail, [...Answer, T[Extract<Head, keyof T>]]>
  : T

export type InternalNameSet = Set<InternalFieldName>

export type Names = {
  mount: InternalNameSet
  unMount: InternalNameSet
  array: InternalNameSet
  watch: InternalNameSet
  focus?: InternalFieldName
  watchAll?: boolean
}

export type FieldNamesMarkedBoolean<T extends FieldValues> = DeepMap<DeepPartial<T>, boolean>

export type FormStateProxy<T extends FieldValues = FieldValues> = {
  isDirty: boolean
  isValidating: boolean
  dirtyFields: FieldNamesMarkedBoolean<T>
  touchedFields: FieldNamesMarkedBoolean<T>
  errors: boolean
  isValid: boolean
}

export type ReadFormState = { [K in keyof FormStateProxy]: boolean | 'all' }

export type FormState<T extends FieldValues> = {
  isDirty: boolean
  isLoading: boolean
  isSubmitted: boolean
  isSubmitSuccessful: boolean
  isSubmitting: boolean
  isValidating: boolean
  isValid: boolean
  submitCount: number
  defaultValues?: undefined | Readonly<DeepPartial<T>>
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<T>>>
  touchedFields: Partial<Readonly<FieldNamesMarkedBoolean<T>>>
  errors: FieldErrors<T>
}

export type FormObservables<TFieldValues extends FieldValues = FieldValues> = {
  values: Observable<{
    name?: InternalFieldName
    type?: EventType
    values: FieldValues
  }>
  array: Observable<{
    name?: InternalFieldName
    values?: FieldValues
  }>
  state: Observable<Partial<FormState<TFieldValues>> & { name?: InternalFieldName }>
}

export type SetValueConfig = {
  shouldValidate?: boolean
  shouldDirty?: boolean
  shouldTouch?: boolean
}

export type GetIsDirty = <T extends InternalFieldName, TData>(name?: T, data?: TData) => boolean

export type TriggerConfig = {
  shouldFocus?: boolean
}

/**
 * Trigger field or form validation
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useform/trigger) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-triggervalidation-forked-xs7hl) • [Video](https://www.youtube.com/watch?v=-bcyJCDjksE)
 *
 * @param name - provide empty argument will trigger the entire form validation, an array of field names will validate an arrange of fields, and a single field name will only trigger that field's validation.
 * @param options - should focus on the error field
 *
 * @returns validation result
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   trigger();
 * }, [trigger])
 *
 * <button onClick={async () => {
 *   const result = await trigger(); // result will be a boolean value
 * }}>
 *  trigger
 *  </button>
 * ```
 */
export type UseFormTrigger<T extends FieldValues> = (
  name?: FieldPath<T> | FieldPath<T>[] | readonly FieldPath<T>[],
  options?: TriggerConfig,
) => Promise<boolean>

type Noop = () => unknown

export type Control<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
  _subjects: FormObservables<TFieldValues>
  _removeUnmounted: Noop
  _names: Names
  _state: {
    mount: boolean
    action: boolean
    watch: boolean
  }
  // _reset: UseFormReset<TFieldValues>;
  _options: UseFormProps<TFieldValues, TContext>
  _getDirty: GetIsDirty
  _resetDefaultValues: Noop
  _formState: FormState<TFieldValues>
  _updateValid: (shouldUpdateValid?: boolean) => void
  _updateFormState: (formState: Partial<FormState<TFieldValues>>) => void
  _fields: FieldRefs
  _formValues: FieldValues
  _proxyFormState: ReadFormState
  _defaultValues: Partial<DefaultValues<TFieldValues>>
  // _getWatch: WatchInternal<TFieldValues>;
  // _updateFieldArray: BatchFieldArrayUpdate;
  _getFieldArray: <TFieldArrayValues>(name: InternalFieldName) => Partial<TFieldArrayValues>[]
  _updateDisabledField: (
    props: {
      disabled?: boolean
      name: FieldName<any>
    } & (
      | {
          field?: Field
          fields?: undefined
        }
      | {
          field?: undefined
          fields?: FieldRefs
        }
    ),
  ) => void
  _executeSchema: (names: InternalFieldName[]) => Promise<{ errors: FieldErrors }>
  register: UseFormRegister<TFieldValues>
  // handleSubmit: UseFormHandleSubmit<TFieldValues>;
  // unregister: UseFormUnregister<TFieldValues>;
  // getFieldState: UseFormGetFieldState<TFieldValues>;
  // setError: UseFormSetError<TFieldValues>;
}

export type UpdateDisabledFieldOptions = {
  disabled?: boolean
  name: FieldName<any>
} & (
  | {
      field?: Field
      fields?: undefined
    }
  | {
      field?: undefined
      fields?: FieldRefs
    }
)
