import { Batchable, Writable } from '@hookform/common/store'
import { cloneObject } from '@hookform/common/utils/clone-object'
import { deepEqual } from '@hookform/common/utils/deep-equal'
import { deepFilter } from '@hookform/common/utils/deep-filter'
import { get, getMultiple } from '@hookform/common/utils/get'
import { isBrowser } from '@hookform/common/utils/is-browser'
import { isEmptyObject } from '@hookform/common/utils/is-empty-object'
import { isObject } from '@hookform/common/utils/is-object'
import { isPrimitive } from '@hookform/common/utils/is-primitive'
import { set } from '@hookform/common/utils/set'
import { toStringArray } from '@hookform/common/utils/to-string-array'
import { unset } from '@hookform/common/utils/unset'

import {
  VALIDATION_EVENTS,
  type CriteriaMode,
  type RevalidationEvent,
  type SubmissionValidationMode,
  type ValidationEvent,
  INPUT_EVENTS,
} from './constants'
import { lookupError } from './logic/errors/lookup-error'
import { filterFields } from './logic/fields/filter-fields'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import { getFieldEventValue } from './logic/fields/get-field-event-value'
import { getFieldValue, getFieldValueAs } from './logic/fields/get-field-value'
import { hasValidation } from './logic/fields/has-validation'
import iterateFieldsByAction from './logic/fields/iterate-fields-by-action'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { elementIsLive } from './logic/html/element-is-live'
import { isHTMLElement } from './logic/html/is-html-element'
import { mergeElementWithField } from './logic/html/merge-element-with-field'
import { getValidationModes } from './logic/validation/get-validation-modes'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { shouldSkipValidationAfter } from './logic/validation/should-skip-validation-after'
import type { ErrorOption, FieldError, FieldErrorRecord, FieldErrors } from './types/errors'
import type { HTMLFieldElement, Field, FieldElement, FieldRecord } from './types/fields'
import type { ParseForm } from './types/parse'
import type { RegisterOptions } from './types/register'
import type { Resolver, ResolverOptions } from './types/resolver'
import type { DeepMap } from './utils/deep-map'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults, ValueOrDeepPartial } from './utils/defaults'
import type { KeysToProperties } from './utils/keys-to-properties'
import type { LiteralUnion } from './utils/literal-union'

export type FormControlState<T = Record<string, any>> = {
  isDirty: boolean
  isLoading: boolean
  isSubmitted: boolean
  isSubmitSuccessful: boolean
  isSubmitting: boolean
  isValidating: boolean
  isValid: boolean
  disabled: boolean
  submitCount: number
  dirtyFields: Partial<Readonly<DeepMap<T, boolean>>>
  touchedFields: Partial<Readonly<DeepMap<T, boolean>>>
  validatingFields: Partial<Readonly<DeepMap<T, boolean>>>
  defaultValues: DeepPartial<T>
  errors: FieldErrors<T>
  values: T
}

export type ProxyFormControlState<T = Record<string, any>> = {
  [K in keyof FormControlState<T>]: boolean
}

export type WritableFormControlState<T = Record<string, any>> = {
  [K in keyof FormControlState<T>]: Writable<FormControlState<T>[K]>
}

export type BatchableFormControlState<T = Record<string, any>> = Batchable<
  WritableFormControlState<T>
>

export type FieldState = {
  invalid: boolean
  isDirty: boolean
  error?: FieldError
  isValidating: boolean
  isTouched: boolean
}

export type FormControlOptions<
  TValues = Record<string, any>,
  TContext = any,
  TParsedForm = ParseForm<TValues>,
> = {
  mode?: ValidationEvent[keyof ValidationEvent]
  reValidateMode?: RevalidationEvent[keyof RevalidationEvent]
  disabled?: boolean
  context?: TContext
  defaultValues?: Defaults<TValues>
  values?: TValues
  errors?: FieldErrors<TValues>
  resetOptions?: ResetOptions
  resolver?: Resolver<TValues, TContext, TParsedForm>
  shouldFocusError?: boolean
  shouldUnregister?: boolean
  shouldUseNativeValidation?: boolean
  progressive?: boolean
  criteriaMode?: CriteriaMode[keyof CriteriaMode]
  delayError?: number
}

export type ResolvedFormControlOptions<TValues, TContext, TParsedForm> = FormControlOptions<
  TValues,
  TContext,
  TParsedForm
> & {
  shouldDisplayAllAssociatedErrors: boolean
  submissionValidationMode: SubmissionValidationMode
  shouldCaptureDirtyFields: boolean
}

export type UpdateDisabledFieldOptions = {
  name: PropertyKey
  disabled?: boolean
  field?: Field
  fields?: FieldRecord
}

export type SetFocusOptions = {
  shouldSelect?: boolean
}

export type TriggerOptions = {
  shouldFocus?: boolean
}

/**
 * Base interface for keeping state.
 */
export type KeepStateOptions = {
  keepDirtyValues?: boolean
  keepErrors?: boolean
  keepDirty?: boolean
  keepIsSubmitSuccessful?: boolean
  keepTouched?: boolean
  keepIsValid?: boolean
}

export interface ResetOptions extends KeepStateOptions {
  keepValues?: boolean
  keepDefaultValues?: boolean
  keepIsSubmitted?: boolean
  keepSubmitCount?: boolean
}

export type ResetFieldOptions<T> = {
  keepDirty?: boolean
  keepTouched?: boolean
  keepError?: boolean
  defaultValue?: T
}

export type ResetAction<T> = (formValues: T) => T

export interface UnregisterOptions extends KeepStateOptions {
  keepValue?: boolean
  keepDefaultValue?: boolean
  keepError?: boolean
  keepIsValidating?: boolean
}

export type SetValueOptions = {
  shouldValidate?: boolean
  shouldDirty?: boolean
  shouldTouch?: boolean
}

export type SetValueResult = {
  isDirty: boolean
  dirtyFieldsChanged: boolean
  touchedFieldsChanged: boolean
}

export type WatchOptions<
  T = Record<string, any>,
  TParsedForm extends ParseForm<T> = ParseForm<T>,
> = {
  name?: keyof TParsedForm | (keyof TParsedForm)[]
  disabled?: boolean
  exact?: boolean
}

export type HandlerCallback = (event?: Partial<Event>) => Promise<void>

export type SubmitHandler<T, TTransformed = T> = TTransformed extends Record<string, any>
  ? (data: TTransformed, event?: Partial<Event>) => unknown
  : (data: T, event?: Partial<Event>) => unknown

export type SubmitErrorHandler<T = Record<string, any>> = (
  errors: FieldErrors<T>,
  event?: Partial<Event>,
) => unknown

export const defaultFormControlOptions: FormControlOptions<any, any> = {
  /**
   * The form values are validated for the first time after submission.
   */
  mode: VALIDATION_EVENTS.onSubmit,

  /**
   * After the form values are validated for the first time, they're validated on every change.
   */
  reValidateMode: VALIDATION_EVENTS.onChange,

  /**
   * If an error is found during validation, the first field with an error is focused.
   */
  shouldFocusError: true,
}

/**
 * Core API.
 *
 * To auto-bind methods, use arrow function syntax.
 * But do so sparingly, since each arrow function (auto-bound method) will need to be re-allocated per instance.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#cannot_be_used_as_methods
 */
export class FormControl<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TFieldValues> = ParseForm<TFieldValues>,
> {
  /**
   * Internally resolved options that control the form control's behavior.
   */
  options: ResolvedFormControlOptions<TFieldValues, TContext, TParsedForm>

  /**
   * State represented as a record of writable stores.
   *
   * This is not optimized for notifications (i.e. renders) because it may notify multiple times in a function.
   *
   * This is ideal for directly subscribing to specific state.
   */
  stores: WritableFormControlState<TFieldValues>

  /**
   * Buffers updates to {@link stores} until it's flushed.
   *
   * This is optimized for notifications (i.e. renders) and generally flushes 1-2 times per function.
   *
   * This is ideal for subscribing to the entire form control state.
   */
  state: BatchableFormControlState<TFieldValues>

  /**
   * Registered fields.
   */
  fields: FieldRecord = {}

  /**
   * Names of fields, describes their current status.
   */
  names = {
    /**
     * Names of fields that are currently mounted.
     */
    mount: new Set<string>(),

    /**
     * Names of fields that are currently unmounted (should be unregistered).
     */
    unMount: new Set<string>(),

    /**
     * Names of field arrays.
     */
    array: new Set<string>(),
  }

  /**
   * Callbacks that are invoked specifically when {@link setValue} or {@link reset} is called.
   *
   * Used by field arrays to directly bypass subscribing to state.
   */
  valueListeners: ((newValues: TFieldValues) => unknown)[] = []

  /**
   * Whether the form has been mounted to the DOM.
   *
   * The form control does not mount automatically, ensure that the implementation handles this.
   */
  mounted = false

  /**
   * Internal timeoutId for debouncing.
   */
  timer = 0

  /**
   */
  delayErrorCallback?: (wait: number) => void

  /**
   */
  action = new Writable(false)

  /**
   * After resetting with `shouldUnregister: true`, the control needs one additional flush.
   */
  needsFlush = false

  constructor(options?: FormControlOptions<TFieldValues, TContext, TParsedForm>) {
    const mode = options?.mode ?? defaultFormControlOptions.mode
    const revalidateMode = options?.reValidateMode ?? defaultFormControlOptions.reValidateMode

    /**
     * Merge the default options and derive additional configuration options for the form.
     */
    this.options = {
      mode,
      reValidateMode: revalidateMode,
      shouldFocusError: defaultFormControlOptions.shouldFocusError,
      shouldDisplayAllAssociatedErrors: options?.criteriaMode === VALIDATION_EVENTS.all,
      submissionValidationMode: {
        beforeSubmission: getValidationModes(mode),
        afterSubmission: getValidationModes(revalidateMode),
      },
      shouldCaptureDirtyFields: Boolean(options?.resetOptions?.keepDirtyValues),
      ...options,
    }

    const initialDefaultValues =
      typeof options?.defaultValues === 'function'
        ? options.defaultValues()
        : options?.defaultValues

    const isLoading = initialDefaultValues instanceof Promise

    const defaultValues: any =
      (!isLoading && cloneObject(initialDefaultValues)) || cloneObject(options?.values ?? {})

    this.stores = {
      submitCount: new Writable(0),
      isDirty: new Writable(false),
      isLoading: new Writable(isLoading),
      isValidating: new Writable(false),
      isSubmitted: new Writable(false),
      isSubmitting: new Writable(false),
      isSubmitSuccessful: new Writable(false),
      isValid: new Writable(false),
      touchedFields: new Writable({}),
      dirtyFields: new Writable({}),
      validatingFields: new Writable({}),
      defaultValues: new Writable(defaultValues),
      errors: new Writable(options?.errors ?? {}),
      values: new Writable(options?.shouldUnregister ? {} : cloneObject(defaultValues)),
      disabled: new Writable(Boolean(options?.disabled)),
    }

    this.state = new Batchable(this.stores, new Set())

    if (isLoading) {
      this.resolveDefaultValues(initialDefaultValues, true)
    }
  }

  debounce = <T extends Function>(callback: T) => {
    return (timeout: number) => {
      clearTimeout(this.timer)
      this.timer = setTimeout(callback, timeout)
    }
  }

  get _fields() {
    return this.fields
  }

  get _formValues() {
    return this.stores.values.value
  }

  /**
   * @todo Rename this.state?
   */
  get _state() {
    return {
      mount: this.mounted,
    }
  }

  // set _state(value) {
  //   _state = value
  // }

  get _defaultValues() {
    return this.stores.defaultValues.value
  }

  get _names() {
    return this.names
  }

  set _names(value) {
    this.names = value
  }

  // get _formState() {
  //   return this._formState
  // }

  // set _formState(value) {
  //   _formState = value
  // }

  get _options() {
    return this.options
  }

  set _options(value) {
    this.options = {
      ...this.options,
      ...value,
    }
  }

  _formState: FormControlState<TFieldValues> = new Proxy(
    {},
    {
      get: (_target, key, _receiver) => {
        return this.stores[key as keyof typeof this.stores].value
      },
    },
  ) as any

  _proxyFormState: ProxyFormControlState<TFieldValues> = new Proxy(
    {},
    {
      get: (_target, key, _receiver) => {
        return this.isTracking(key as any)
      },
    },
  ) as any

  async updateValid(force?: boolean, name?: PropertyKey | PropertyKey[]): Promise<void> {
    if (force || this.isTracking('isValid', name)) {
      const result = await this.validate()

      const fieldNames = toStringArray(name)

      this.stores.isValid.set(result.isValid, fieldNames)
    }
  }

  updateIsValidating(names = Array.from(this.names.mount), isValidating?: boolean) {
    if (!(this.isTracking('isValidating', names) || this.isTracking('validatingFields', names))) {
      return
    }

    this.state.open()

    this.stores.validatingFields.update((validatingFields) => {
      names.filter(Boolean).forEach((name) => {
        if (isValidating) {
          set(validatingFields, name, isValidating)
        } else {
          unset(validatingFields, name)
        }
      })
      return validatingFields
    }, names)

    this.stores.isValidating.set(!isEmptyObject(this._formState.validatingFields), names)

    this.state.flush()
  }

  /**
   */
  updateErrors(name: string, error: FieldError) {
    this.stores.errors.update((errors) => {
      set(errors, name, error)
      return errors
    }, name)
  }

  setErrors(errors: FieldErrors<TFieldValues>) {
    this.state.open()

    this.stores.errors.set(errors)
    this.stores.isValid.set(false)

    this.state.flush()
  }

  /**
   * Touch a field.
   *
   * @returns Whether the field was modified.
   */
  updateTouchAndDirty(name: PropertyKey, value?: unknown, options?: SetValueOptions): boolean {
    let result = false

    if (options?.shouldDirty) {
      const updateDirtyResult = this.updateDirtyField(name, value)
      result ||= updateDirtyResult
    }

    if (options?.shouldTouch) {
      const updateTouchedResult = this.updateTouchedField(name)
      result ||= updateTouchedResult
    }

    return result
  }

  shouldRenderByError(name: string, isValid?: boolean, error?: FieldError, modified?: boolean) {
    this.state.open()

    const previousFieldError = get(this._formState.errors, name)

    if (this.options.delayError && error) {
      this.delayErrorCallback = this.debounce(() => this.updateErrors(name, error))
      this.delayErrorCallback(this.options.delayError)
    } else {
      clearTimeout(this.timer)
      this.delayErrorCallback = undefined
      this.stores.errors.update((errors) => {
        if (error) {
          set(errors, name, error)
        } else {
          unset(errors, name)
        }
        return errors
      }, name)
    }

    const hasError = error ? !deepEqual(previousFieldError, error) : previousFieldError

    if (
      (hasError || !modified || this.isTracking('isValid', name)) &&
      typeof isValid === 'boolean'
    ) {
      this.stores.isValid.set(isValid, name)
    }

    this.state.flush()
  }

  /**
   * Validate the form.
   */
  async validate(
    name?: PropertyKey | PropertyKey[] | readonly PropertyKey[],
    values = this._formValues,
  ) {
    const nameArray = toStringArray(name)

    if (this.options.resolver == null) {
      this.updateIsValidating(nameArray, true)

      const validationResult = await this.executeBuiltInValidation(nameArray, undefined, values)

      this.updateIsValidating(nameArray)

      const isValid = validationResult.valid

      return { validationResult, isValid }
    }

    const names = nameArray ?? Array.from(this.names.mount)

    const fields = filterFields(names, this.fields)

    const resolverOptions: ResolverOptions<TFieldValues, TParsedForm> = {
      names: names as (keyof TParsedForm)[],
      fields,
      criteriaMode: this.options.criteriaMode,
      shouldUseNativeValidation: this.options.shouldUseNativeValidation,
    }

    this.updateIsValidating(nameArray, true)

    const resolverResult = await this.options.resolver(
      values,
      this.options.context,
      resolverOptions,
    )

    this.updateIsValidating(nameArray)

    const isValid = Array.isArray(name)
      ? !name.some((n) => get(resolverResult.errors, n))
      : isEmptyObject(resolverResult.errors)

    return { resolverResult, isValid }
  }

  /**
   * Natively validate the form control's values.
   */
  async executeBuiltInValidation(
    names?: string | string[],
    shouldOnlyCheckValid?: boolean,
    values = this._formValues,
  ): Promise<NativeValidationResult> {
    const fields = deepFilter(this.fields, names)

    return nativeValidateFields(fields, values, {
      shouldOnlyCheckValid,
      shouldUseNativeValidation: this.options.shouldUseNativeValidation,
      shouldDisplayAllAssociatedErrors: this.options.shouldDisplayAllAssociatedErrors,
      isFieldArrayRoot: (name) => this.names.array.has(name),
    })
  }

  removeUnmounted(): void {
    for (const name of this.names.unMount) {
      const field: Field | undefined = get(this.fields, name)

      if (field == null) continue

      if (field?._f.refs ? !field._f.refs.some(elementIsLive) : !elementIsLive(field?._f.ref)) {
        this.unregister(name as keyof TParsedForm)
      }

      this.names.unMount.delete(name)
    }
  }

  /**
   * Evaluate whether the current form values are different from the default values.
   */
  getDirty(name?: PropertyKey, data?: any): boolean {
    if (name && data) {
      this.stores.values.update((values) => {
        set(values, name, data)
        return values
      }, name)
    }

    return !deepEqual(this.getValues(), this._defaultValues)
  }

  getWatch(
    name?: PropertyKey | PropertyKey[],
    defaultValue?: DeepPartial<TFieldValues>,
    isGlobal?: boolean,
  ): any {
    const nameArray = toStringArray(name) ?? []

    if (isGlobal) {
      if (nameArray.length) {
        this.state.track('values', nameArray)
      } else {
        this.state.track('values')
      }
    }

    const values = this.mounted
      ? this._formValues
      : defaultValue == null
      ? this._defaultValues
      : typeof name === 'string'
      ? { [name]: defaultValue }
      : defaultValue

    const valuesCopy = { ...values }

    switch (nameArray.length) {
      case 0: {
        return valuesCopy
      }
      case 1: {
        const rawResult = get(valuesCopy, nameArray[0])
        const result = rawResult === undefined ? defaultValue : rawResult
        return Array.isArray(name) ? [result] : result
      }
      default: {
        return Object.values(deepFilter(valuesCopy, nameArray)) ?? defaultValue
      }
    }
  }

  getFieldArray<T>(name: string): Partial<T>[] {
    const values = this.getValues()

    const defaultValue = this.options.shouldUnregister ? get(this._defaultValues, name, []) : []

    const result: string[] = get(values, name, defaultValue)

    return result.filter(Boolean) as any
  }

  /**
   * Attempt to directly set a field's "value" property.
   */
  setFieldValue(name: PropertyKey, value: unknown, options?: SetValueOptions) {
    const field: Field | undefined = get(this.fields, name)

    const fieldReference = field?._f

    let fieldValue = value

    if (fieldReference != null) {
      if (!fieldReference.disabled) {
        set(this._formValues, name, getFieldValueAs(value, fieldReference))
      }

      fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

      const mutatedInputType = updateFieldReference(fieldReference, fieldValue)

      if (mutatedInputType === 'custom') {
        this.stores.values.update((values) => values, name)
      }
    }

    this.updateTouchAndDirty(name, fieldValue, options)

    if (options?.shouldValidate) {
      this.trigger(name as keyof TParsedForm)
    }
  }

  /**
   * Set multiple field values, i.e. for a field array.
   */
  setValues(name: PropertyKey, value: any, options?: SetValueOptions) {
    this.state.open()

    for (const fieldKey in value) {
      const fieldValue = value[fieldKey]
      const fieldName = `${name.toString()}.${fieldKey}`
      const field: Field | undefined = get(this.fields, fieldName)

      const isFieldArray = this.names.array.has(fieldName)
      const missingReference = field && !field._f
      const isDate = fieldValue instanceof Date

      if ((isFieldArray || !isPrimitive(fieldValue) || missingReference) && !isDate) {
        this.setValues(fieldName, fieldValue, options)
      } else {
        this.setFieldValue(fieldName, fieldValue, options)
      }
    }

    this.state.flush()
  }

  /**
   * Set a specific field's value.
   */
  setValue<T extends keyof TParsedForm>(
    name: T,
    value: TParsedForm[T],
    options?: SetValueOptions,
  ): void {
    const field: Field | undefined = get(this.fields, name)
    const isFieldArray = this.names.array.has(name as string)
    const clonedValue = cloneObject(value)

    this.state.open()

    this.stores.values.update((values) => {
      set(values, name, clonedValue)
      return values
    }, name)

    if (isFieldArray) {
      this.state.flush()
      this.state.open()

      if (
        this.isTracking('isDirty', name) ||
        (this.isTracking('dirtyFields', name) && options?.shouldDirty)
      ) {
        const dirtyFields = getDirtyFields(this._defaultValues, this._formValues)
        this.stores.dirtyFields.set(dirtyFields, name)

        const isDirty = this.getDirty(name, clonedValue)
        this.stores.isDirty.set(isDirty, name)

        this.state.flush()
        this.state.open()
      }
    } else {
      if (field && !field._f && clonedValue != null) {
        this.setValues(name, clonedValue, options)
      } else {
        this.setFieldValue(name, clonedValue, options)
      }
    }

    this.stores.values.update((values) => values, name)

    this.valueListeners.forEach((listener) => listener(this.stores.values.value))

    this.state.flush()
  }

  /**
   * Handle a change event.
   *
   * @param event The actual HTML input event. e.g. React.ChangeEvent.nativeEvent.
   * @param original Escape hatch for the "original" event, i.e. React's synthetic event.
   */
  async onChange(event: { target: any; type?: any }, original?: any): Promise<void> {
    this.mounted = true

    const name = (event.target as HTMLInputElement)?.name

    const field: Field | undefined = get(this.fields, name)

    if (field == null) return

    this.state.open()

    const fieldValue = getFieldEventValue(event, field)

    set(this._formValues, name, fieldValue)

    const isBlurEvent = event.type === INPUT_EVENTS.BLUR || event.type === INPUT_EVENTS.FOCUS_OUT

    if (this.isTracking('values', name) && !isBlurEvent) {
      this.stores.values.update((values) => values, name)
    }

    const nothingToValidate =
      !hasValidation(field._f) &&
      !this.options.resolver &&
      !get(this._formState.errors, name) &&
      !field._f.deps

    const shouldSkipValidation =
      nothingToValidate || this.shouldSkipValidationAfter(name, isBlurEvent)

    if (shouldSkipValidation) {
      this.updateValid()

      if (isBlurEvent) {
        set(this._formValues, name, fieldValue)

        field._f.onBlur?.(original ?? event)

        this.delayErrorCallback?.(0)

        this.updateTouchedField(name)
      } else {
        this.updateDirtyField(name, fieldValue)
        field._f.onChange?.(original ?? event)
      }

      this.state.flush()

      return
    }

    const nameArray = toStringArray(name)

    this.stores.validatingFields.update((validatingFields) => {
      nameArray?.forEach((name) => {
        set(validatingFields, name, true)
      })
      return validatingFields
    }, name)

    const currentIsValidating = !isEmptyObject(this._formState.validatingFields)

    this.stores.isValidating.set(currentIsValidating, name)

    this.state.flush()
    this.state.open()

    if (isBlurEvent) {
      set(this._formValues, name, fieldValue)

      field._f.onBlur?.(original ?? event)

      this.delayErrorCallback?.(0)

      this.updateTouchedField(name)
    } else {
      this.updateDirtyField(name, fieldValue)
      field._f.onChange?.(original ?? event)
    }

    const result = await this.validate(name)

    if (result.resolverResult) {
      const isFieldValueUpdated = this.isFieldValueUpdated(name, fieldValue)

      if (isFieldValueUpdated) {
        const previousError = lookupError(this._formState.errors, this.fields, name)

        const currentError = lookupError(
          result.resolverResult.errors ?? {},
          this.fields,
          previousError.name,
        )

        if (currentError.error) {
          set(this._formState.errors, currentError.name, currentError.error)
        } else {
          unset(this._formState.errors, currentError.name)
        }

        if (!deepEqual(previousError, currentError)) {
          this.stores.errors.update((errors) => errors, name)
        }
      }

      if (field._f.deps) {
        await this.trigger(field._f.deps as keyof TParsedForm)
      } else {
        this.stores.isValid.set(result.isValid, name)
      }
    }

    if (result.validationResult) {
      if (!result.isValid) {
        const error = result.validationResult.errors[name]

        const isFieldValueUpdated = this.isFieldValueUpdated(name, fieldValue)

        if (isFieldValueUpdated && !error) {
          const fullResult = await this.validate()

          if (fullResult.validationResult?.errors) {
            this.mergeErrors(fullResult.validationResult.errors, fullResult.validationResult.names)
          }
        } else {
          if (this.options.delayError) {
            this.delayErrorCallback = this.debounce(() => {
              this.stores.errors.update((errors) => {
                set(errors, name, error)
                return errors
              }, name)
            })

            this.delayErrorCallback(this.options.delayError)
          } else {
            clearTimeout(this.timer)

            this.delayErrorCallback = undefined

            const previousError = get(this._formState.errors, name)

            set(this._formState.errors, name, error)

            const shouldNotify = previousError == null || !deepEqual(previousError, error)

            if (shouldNotify) {
              this.stores.errors.update((errors) => errors, name)
            }
          }
        }
      } else {
        /**
         * If there was a previous error, then make sure a notification is made to remove it.
         */
        const previousFieldError = get(this._formState.errors, name)

        this.mergeErrors(
          result.validationResult.errors,
          result.validationResult.names,
          !previousFieldError,
        )
      }

      const isFieldValueUpdated = this.isFieldValueUpdated(name, fieldValue)

      if (isFieldValueUpdated && field._f.deps) {
        await this.trigger(field._f.deps as any)
      } else if (this.isTracking('isValid', name)) {
        const fullValidationResult = await this.executeBuiltInValidation(undefined, true)
        this.stores.isValid.set(fullValidationResult.valid, name)
      }
    }

    this.stores.validatingFields.update((validatingFields) => {
      nameArray?.forEach((name) => {
        unset(validatingFields, name)
      })
      return validatingFields
    }, name)

    const isValidating = !isEmptyObject(this._formState.validatingFields)

    this.stores.isValidating.set(isValidating, name)

    this.state.flush()
  }

  focusInput = (element: FieldElement, name: string) => {
    if (get(this._formState.errors, name) && element.focus) {
      element.focus()
      return 1
    }
    return
  }

  /**
   * Trigger a field.
   */
  async trigger<T extends keyof TParsedForm>(
    name?: T | T[] | readonly T[],
    options?: TriggerOptions,
  ): Promise<boolean> {
    const fieldNames = toStringArray(name)

    this.stores.isValidating.set(true, name)

    const result = await this.validate(fieldNames)

    if (result.isValid || this._formState.isValid) {
      this.updateValid()
    }

    this.state.open()

    if (result.validationResult) {
      this.mergeErrors(result.validationResult.errors, result.validationResult.names)
    }

    if (result.isValid) {
      this.stores.errors.update((errors) => {
        fieldNames?.forEach((name) => {
          unset(errors, name)
        })
        return errors
      })
    } else if (result.resolverResult?.errors && !isEmptyObject(result.resolverResult?.errors)) {
      this.mergeErrors(result.resolverResult.errors, name)
    }

    // `true` context will match will all field names.
    this.stores.isValid.set(result.isValid, true)

    this.stores.isValidating.set(false, name)

    if (options?.shouldFocus && !result.isValid) {
      focusFieldBy(
        this.fields,
        (key?: string) => key && get(this._formState.errors, key),
        name ? fieldNames : this.names.mount,
      )
    }

    this.state.flush()

    return result.isValid
  }

  getValues<T extends keyof TParsedForm>(fieldNames?: T | readonly T[] | T[]) {
    const values = {
      ...(this.mounted ? this._formValues : this._defaultValues),
    }

    return fieldNames == null
      ? values
      : typeof fieldNames === 'string'
      ? get(values, fieldNames)
      : getMultiple(values, fieldNames)
  }

  /**
   * Get the current state of a field.
   */
  getFieldState(name: string, formState?: FormControlState<TFieldValues>): FieldState {
    const errors = formState?.errors ?? this._formState.errors
    const dirtyFields = formState?.dirtyFields ?? this._formState.dirtyFields
    const validatingFields = formState?.validatingFields ?? this._formState.validatingFields
    const touchedFields = formState?.touchedFields ?? this._formState.touchedFields

    return {
      invalid: Boolean(get(errors, name)),
      isDirty: Boolean(get(dirtyFields, name)),
      error: get(errors, name),
      isValidating: Boolean(get(validatingFields, name)),
      isTouched: Boolean(get(touchedFields, name)),
    }
  }

  /**
   * Clear errors on a field.
   */
  clearErrors(name?: string | string[]): void {
    if (name == null) {
      this.stores.errors.set({})
      return
    }

    const nameArray = toStringArray(name)

    this.stores.errors.update((errors) => {
      nameArray?.forEach((name) => unset(this._formState.errors, name))
      return errors
    }, nameArray)
  }

  /**
   * Set an error on a field.
   */
  setError<T extends keyof TParsedForm>(
    name: T | 'root' | `root.${string}`,
    error?: ErrorOption,
    options?: TriggerOptions,
  ): void {
    this.state.open()

    const field: Field | undefined = get(this.fields, name)

    const ref = field?._f?.ref

    const fieldNames = toStringArray(name)

    const currentError: FieldError | undefined = get(this._formState.errors, name)

    // Don't override existing error messages elsewhere in the object tree.
    const { ref: _ref, message: _message, type: _type, ...currentErrorTree } = currentError ?? {}

    this.stores.errors.update((errors) => {
      set(errors, name, { ...currentErrorTree, ...error, ref })
      return errors
    }, fieldNames)

    this.stores.isValid.set(false, fieldNames)

    if (options?.shouldFocus) {
      ref?.focus?.()
    }

    this.state.flush()
  }

  /**
   * Makes {@link state} subscribe to all updates to values for all field names.
   */
  watch(): TFieldValues

  /**
   * Subscribe to all updates to {@link state}.
   */
  watch(callback: (data: any, context: { name?: string; type?: string }) => void): {
    unsubscribe: () => void
  }

  /**
   * Makes {@link state} subscribe to all updates to values for a specific field name.
   */
  watch<T extends keyof TParsedForm>(name: T, defaultValues?: TParsedForm[T]): TParsedForm[T]

  /**
   * Makes {@link state} subscribe to all updates to values for multiple field names.
   */
  watch<T extends (keyof TParsedForm)[]>(
    name: T,
    defaultValues?: KeysToProperties<TParsedForm, T>,
  ): KeysToProperties<TParsedForm, T>

  /**
   * Implementation.
   *
   * Although this function can't re-run itself and isn't a subscription,
   * this works in React because {@link state} will initialize the re-render,
   * causing the component to re-run this function and evaluate new watched values.
   */
  watch(...args: any[]): any {
    if (typeof args[0] === 'function') {
      const child = this.state.clone()

      child.track('values')

      const unsubscribeChild = child.subscribe(
        (state, context) => {
          return args[0]({ ...state.values }, context ?? this.options.context)
        },
        undefined,
        false,
      )

      const unsubscribe = () => {
        unsubscribeChild()
        this.state.children.delete(child)
      }

      return { unsubscribe }
    }

    const [name, defaultValue] = args

    return this.getWatch(name, defaultValue, true)
  }

  /**
   * Unregister a field from the form control.
   */
  unregister<T extends keyof TParsedForm>(
    name?: T | T[] | readonly T[],
    options?: UnregisterOptions,
  ): void {
    this.state.open()

    const fieldNames = toStringArray(name) ?? Array.from(this.names.mount)

    for (const fieldName of fieldNames) {
      this.names.mount.delete(fieldName)
      this.names.array.delete(fieldName)

      if (!options?.keepValue) {
        unset(this.fields, fieldName)

        this.stores.values.update((values) => {
          unset(values, fieldName)
          return values
        }, fieldName)
      }

      if (!options?.keepError) {
        this.stores.errors.update((errors) => {
          unset(errors, fieldName)
          return errors
        }, fieldName)
      }

      if (!options?.keepDirty) {
        this.stores.dirtyFields.update((dirtyFields) => {
          unset(dirtyFields, fieldName)
          return dirtyFields
        }, fieldName)
      }

      if (!options?.keepTouched) {
        this.stores.touchedFields.update((touchedFields) => {
          unset(touchedFields, fieldName)
          return touchedFields
        }, fieldName)
      }

      if (!options?.keepIsValidating) {
        this.stores.validatingFields.update((validatingFields) => {
          unset(validatingFields, fieldName)
          return validatingFields
        }, fieldName)
      }

      if (!this.options.shouldUnregister && !options?.keepDefaultValue) {
        this.stores.defaultValues.update((defaultValues) => {
          unset(defaultValues, fieldName)
          return defaultValues
        }, fieldName)
      }
    }

    if (!options?.keepIsValid) {
      this.updateValid(undefined, fieldNames)
    }

    if (!options?.keepDirty) {
      const isDirty = this.getDirty()
      this.stores.isDirty.set(isDirty, fieldNames)
    }

    // Flush the buffer and force an update.
    this.state.flush(true)
  }

  /**
   * Update a field's disabled status.
   */
  updateDisabledField(options: UpdateDisabledFieldOptions): boolean {
    if (typeof options.disabled !== 'boolean') return false

    const value = options.disabled
      ? undefined
      : get(this._formValues, options.name) ??
        getFieldValue(options.field?._f ?? get(options.fields, options.name)._f) ??
        get(this._defaultValues, options.name)

    this.stores.values.update((values) => {
      set(values, options.name, value)
      return values
    }, options.name)

    return this.updateDirtyField(options.name, value)
  }

  focusError = () => {
    if (this.options.shouldFocusError) {
      iterateFieldsByAction(this.fields, this.focusInput, this.names.mount)
    }
  }

  disableForm(disabled?: boolean) {
    if (typeof disabled !== 'boolean') return

    this.stores.disabled.set(disabled)

    const disableInput = (element: FieldElement, name: string) => {
      const field: Field | undefined = get(this.fields, name)

      if (field == null) return

      element.disabled = field._f.disabled || disabled

      if (Array.isArray(field._f.refs)) {
        field._f.refs.forEach((inputRef) => {
          inputRef.disabled = field._f.disabled || disabled
        })
      }
    }

    iterateFieldsByAction(this.fields, disableInput, 0, false)
  }

  /**
   * Handle a submit event.
   *
   * @returns A submission event handler.
   */
  handleSubmit(
    onValid?: SubmitHandler<TFieldValues, TTransformedValues>,
    onInvalid?: SubmitErrorHandler<TFieldValues>,
  ): HandlerCallback {
    return async (event) => {
      event?.preventDefault?.()
      // event?.persist?.()

      /**
       * Clone the object to prevent race conditions from mutations during the submit handling.
       */
      const values = cloneObject(this._formValues)

      this.stores.isSubmitting.set(true)

      this.state.open()

      const { resolverResult, validationResult } = await this.validate(undefined, values)

      const errors = resolverResult?.errors ?? validationResult?.errors ?? {}

      unset(this._formState.errors, 'root')

      if (validationResult) {
        this.mergeErrors(errors, validationResult?.names)
      } else {
        this.stores.errors.set(resolverResult.errors ?? {})
      }

      let validCallbackError = undefined

      const isValid = isEmptyObject(this._formState.errors)

      if (isValid) {
        try {
          const data = cloneObject(resolverResult?.values ?? values) as any
          await onValid?.(data, event)
        } catch (e) {
          validCallbackError = e
        }
      } else {
        await onInvalid?.(errors, event)
        this.focusError()
        setTimeout(this.focusError)
      }

      this.stores.isSubmitted.set(true)
      this.stores.isSubmitting.set(false)
      this.stores.isSubmitSuccessful.set(isValid && !validCallbackError)
      this.stores.submitCount.update((count) => count + 1)

      this.state.flush()

      if (validCallbackError) {
        throw validCallbackError
      }
    }
  }

  resetField<T extends keyof TParsedForm>(name: T, options?: ResetFieldOptions<TParsedForm[T]>) {
    const field: Field | undefined = get(this.fields, name)

    if (field == null) return

    this.state.open()

    if (options?.defaultValue == null) {
      const defaultFieldValue = get(this._defaultValues, name)
      const clonedDefaultFieldValue = cloneObject(defaultFieldValue)
      this.setValue(name, clonedDefaultFieldValue)
    } else {
      this.setValue(name, options?.defaultValue)
      this.stores.defaultValues.update((defaultValues) => {
        const clonedDefaultValue = cloneObject(options.defaultValue)
        set(defaultValues, name, clonedDefaultValue)
        return defaultValues
      }, name)
    }

    if (!options?.keepTouched) {
      this.stores.touchedFields.update((touchedFields) => {
        unset(touchedFields, name)
        return touchedFields
      }, name)
    }

    if (!options?.keepDirty) {
      this.stores.dirtyFields.update((dirtyFields) => {
        unset(dirtyFields, name)
        return dirtyFields
      }, name)

      const isDirty = options?.defaultValue
        ? this.getDirty(name, cloneObject(get(this._defaultValues, name)))
        : this.getDirty()

      this.stores.isDirty.set(isDirty, name)
    }

    if (!options?.keepError) {
      this.stores.errors.update((errors) => {
        unset(errors, name)
        return errors
      }, name)

      if (this.isTracking('isValid', name)) {
        this.updateValid(undefined, name)
      }
    }

    this.state.flush()
  }

  /**
   * Reset the form control.
   */
  reset(formValues?: Defaults<TFieldValues>, options?: ResetOptions): void {
    this.state.open()

    const updatedValues = formValues ? cloneObject(formValues) : this._defaultValues
    const cloneUpdatedValues = cloneObject(updatedValues)
    const isEmptyResetValues = isEmptyObject(formValues)
    const values = isEmptyResetValues ? this._defaultValues : cloneUpdatedValues

    if (!options?.keepDefaultValues) {
      this.resolveDefaultValues(formValues)
    }

    if (!options?.keepValues) {
      if (options?.keepDirtyValues) {
        this.mergeDirtyValues(values)
      } else {
        if (isBrowser && formValues == null) {
          this.resetFormElement()
        }
        this.fields = {}
      }

      const newValues = this.options.shouldUnregister
        ? options?.keepDefaultValues
          ? cloneObject(this._defaultValues)
          : {}
        : cloneObject(values)

      this.stores.values.set(newValues as TFieldValues)
    }

    this.names = {
      mount: options?.keepDirtyValues ? this.names.mount : new Set(),
      unMount: new Set(),
      array: new Set(),
    }

    this.mounted =
      !this.isTracking('isValid') ||
      Boolean(options?.keepIsValid) ||
      Boolean(options?.keepDirtyValues)

    this.needsFlush = Boolean(this.options.shouldUnregister)

    if (!options?.keepSubmitCount) {
      this.stores.submitCount.set(0)
    }

    if (isEmptyResetValues) {
      this.stores.isDirty.set(false)
    } else if (!options?.keepDirty) {
      const isDirty = Boolean(
        options?.keepDefaultValues && !deepEqual(formValues, this._defaultValues),
      )
      this.stores.isDirty.set(isDirty)
    }

    if (!options?.keepIsSubmitted) {
      this.stores.isSubmitted.set(false)
    }

    if (isEmptyResetValues) {
      if (!isEmptyObject(this._formState.dirtyFields)) {
        this.stores.dirtyFields.set({})
      }
    } else if (options?.keepDirtyValues) {
      if (options?.keepDefaultValues && this._formValues) {
        const dirtyFields = getDirtyFields(this._defaultValues, this._formValues)
        this.stores.dirtyFields.set(dirtyFields)
      }
    } else if (options?.keepDefaultValues && formValues) {
      const dirtyFields = getDirtyFields(this._defaultValues, formValues as any)
      this.stores.dirtyFields.set(dirtyFields)
    } else if (!options?.keepDirty && !isEmptyObject(this._formState.dirtyFields)) {
      this.stores.dirtyFields.set({})
    }

    if (!options?.keepTouched && !isEmptyObject(this._formState.touchedFields)) {
      this.stores.touchedFields.set({})
    }

    if (!options?.keepErrors && !isEmptyObject(this._formState.errors)) {
      this.stores.errors.set({})
    }

    if (!options?.keepIsSubmitSuccessful) {
      this.stores.isSubmitSuccessful.set(false)
    }

    this.stores.isSubmitting.set(false)

    this.valueListeners.forEach((listener) => listener(this._formValues))

    this.state.flush(true)
  }

  /**
   * Focus on an element registered in the form.
   */
  setFocus<T extends keyof TParsedForm>(name: T, options?: SetFocusOptions) {
    const field: Field | undefined = get(this.fields, name)

    if (field?._f == null) return

    const fieldRef = field?._f.refs ? field?._f.refs[0] : field?._f.ref

    if (fieldRef == null) return

    fieldRef.focus?.()

    if (options?.shouldSelect && 'select' in fieldRef) {
      fieldRef?.select?.()
    }
  }

  /**
   * @returns void | Promise<void> depending on the defaultValues provided.
   */
  resetDefaultValues() {
    if (typeof this.options.defaultValues === 'function') {
      const resolvingDefaultvalues = this.options.defaultValues()

      if (resolvingDefaultvalues instanceof Promise) {
        resolvingDefaultvalues.then((resolvedDefaultValues) => this.reset(resolvedDefaultValues))
      } else {
        this.reset(resolvingDefaultvalues)
      }
    }
  }

  //--------------------------------------------------------------------------------------
  // Custom methods (not part of react-hook-form).
  //--------------------------------------------------------------------------------------

  /**
   * Resolve default values.
   *
   * Can be synchronous or asynchronous depending on the default values provided.
   */
  resolveDefaultValues(
    defaults?: Defaults<TFieldValues>,
    resetValues?: boolean,
  ): void | Promise<void> {
    const resolvingDefaultValues = typeof defaults === 'function' ? defaults() : defaults

    if (resolvingDefaultValues == null) {
      this.stores.isLoading.set(false)
      return
    }

    const isPromise = resolvingDefaultValues instanceof Promise

    // The store will not notify subscribers if `isPromise` is the same as `isLoading`.
    this.stores.isLoading.set(isPromise)

    if (isPromise) {
      return resolvingDefaultValues.then((resolvedDefaultValues = {} as any) => {
        this.finalizeResolveDefaultValues(resolvedDefaultValues, resetValues)
      })
    }

    const resolvedDefaultValues = resolvingDefaultValues ?? {}

    return this.finalizeResolveDefaultValues(resolvedDefaultValues, resetValues)
  }

  /**
   * Always finalize the resolution of default values synchronously.
   */
  finalizeResolveDefaultValues(
    resolvedDefaultValues: ValueOrDeepPartial<TFieldValues>,
    resetValues?: boolean,
  ) {
    this.state.open()

    const defaultValues: any = cloneObject(resolvedDefaultValues)

    this.stores.defaultValues.set(defaultValues)

    if (resetValues) {
      this.stores.values.set(defaultValues, true)
    }

    this.stores.isLoading.set(false)

    this.state.flush()
  }

  /**
   * Whether the form control is currently tracking a specific state property.
   *
   * {@link state} does not trigger updates for untracked properties.
   */
  isTracking(key: keyof typeof this.stores, name?: PropertyKey | PropertyKey[]): boolean {
    return this.state.isTracking(key, name) || this.state.childIsTracking(key, name)
  }

  /**
   * Whether the form control should skip validation after a specific event.
   */
  shouldSkipValidationAfter(name: string, isBlurEvent?: boolean): boolean {
    return shouldSkipValidationAfter(
      isBlurEvent ? 'blur' : 'change',
      get(this._formState.touchedFields, name),
      this._formState.isSubmitted,
      this.options.submissionValidationMode,
    )
  }

  /**
   * Merge provided errors the form state's existing errors.
   */
  mergeErrors(
    errors: FieldErrors<TFieldValues> | FieldErrorRecord,
    names?: PropertyKey | PropertyKey[] | readonly PropertyKey[],
    silent?: boolean,
  ): void {
    const namesToMerge = toStringArray(names) ?? Object.keys(errors)

    namesToMerge.forEach((name) => {
      const fieldError = get(errors, name)

      if (fieldError == null) {
        unset(this._formState.errors, name)
        return
      }

      if (!this.names.array.has(name)) {
        set(this._formState.errors, name, fieldError)
        return
      }

      const fieldArrayErrors = get(this._formState.errors, name) ?? {}

      set(fieldArrayErrors, 'root', errors[name])

      set(this._formState.errors, name, fieldArrayErrors)
    })

    if (!silent) {
      this.stores.errors.update((errors) => errors, namesToMerge)
    }
  }

  /**
   * Update a field's dirty status.
   *
   * @return Whether the field's dirty status changed.
   */
  updateDirtyField(name: PropertyKey, value?: unknown): boolean {
    const field: Field | undefined = get(this.fields, name)

    const isDisabled = Boolean(field?._f.disabled)

    const defaultValue = get(this._defaultValues, name)

    const currentIsDirty = !deepEqual(defaultValue, value)

    const previousIsDirty = Boolean(!isDisabled && get(this._formState.dirtyFields, name))

    if (this.isTracking('isDirty', name)) {
      const isDirty = this.getDirty()
      this.stores.isDirty.set(isDirty, name)
    }

    if (previousIsDirty && !currentIsDirty) {
      this.stores.dirtyFields.update((dirtyFields) => {
        unset(dirtyFields, name)
        return dirtyFields
      }, name)
    }

    if (!previousIsDirty && currentIsDirty) {
      this.stores.dirtyFields.update((dirtyFields) => {
        set(dirtyFields, name, true)
        return dirtyFields
      }, name)
    }

    return currentIsDirty !== previousIsDirty
  }

  /**
   * Update a field's "touched" property.
   */
  updateTouchedField(name: PropertyKey): boolean {
    const previousIsTouched = get(this._formState.touchedFields, name)

    if (!previousIsTouched) {
      this.stores.touchedFields.update((touchedFields) => {
        set(touchedFields, name, true)
        return touchedFields
      }, name)
    }

    return !previousIsTouched
  }

  /**
   * For every mounted field:
   * If it's dirty, update the provided values with the field's value from the form control.
   * Else, update the form control's value from the provided values.
   */
  mergeDirtyValues(values: unknown): void {
    for (const fieldName of this.names.mount) {
      const fieldIsDirty = get(this._formState.dirtyFields, fieldName)

      if (fieldIsDirty) {
        const dirtyFieldValue = get(this._formValues, fieldName)
        set(values, fieldName, dirtyFieldValue)
      } else {
        const updatedFieldValue = get(values, fieldName)
        this.setValue(fieldName as keyof TParsedForm, updatedFieldValue)
      }
    }
  }

  /**
   * Resets the nearest {@link HTMLFormElement}.
   */
  resetFormElement(): void {
    for (const name of this.names.mount) {
      const field: Field | undefined = get(this.fields, name)

      if (field?._f == null) {
        continue
      }

      const fieldReference = Array.isArray(field._f.refs) ? field._f.refs[0] : field._f.ref

      if (!isHTMLElement(fieldReference)) {
        continue
      }

      const form = fieldReference.closest('form')

      if (form) {
        form.reset()
        break
      }
    }
  }

  /**
   * Register a field with the form control.
   */
  registerField<T extends keyof ParseForm<TFieldValues>>(
    name: T,
    options?: RegisterOptions<TFieldValues, T>,
  ) {
    this.state.open()

    const existingField: Field | undefined = get(this.fields, name)

    const field: Field = {
      ...existingField,
      _f: {
        ...(existingField?._f ?? { ref: { name } }),
        name,
        mount: true,
        ...options,
      } as any,
    }

    set(this.fields, name, field)

    this.names.mount.add(name.toString())

    if (existingField) {
      const disabled = options?.disabled ?? this.options.disabled
      this.updateDisabledField({ field, disabled, name })
    } else {
      const defaultValue =
        options?.value ?? get(this._formValues, name) ?? get(this._defaultValues, name)

      this.stores.values.update((values) => {
        set(values, name, defaultValue)
        return values
      }, name)

      if (this.mounted) {
        this.updateValid()
      }
    }

    this.state.close()

    if (!this.needsFlush && this.state.depth === 0) {
      this.state.buffer = []
    }

    return field
  }
  /**
   * Register an element with the form control.
   */
  registerElement<T extends keyof ParseForm<TFieldValues>>(
    name: T,
    element: HTMLFieldElement,
    options?: RegisterOptions<TFieldValues, T>,
  ): void {
    this.state.open()

    const field = this.registerField(name, options)

    const newField = mergeElementWithField(name, field, element, this._defaultValues)

    set(this.fields, name, newField)

    const defaultValue = get(this._formValues, name) ?? get(this._defaultValues, name)

    if (defaultValue == null || (element as HTMLInputElement)?.defaultChecked) {
      set(this._formValues, name, getFieldValue(newField._f))
    } else {
      set(this._formValues, name, getFieldValueAs(defaultValue, newField._f))
      updateFieldReference(newField._f, defaultValue)
    }

    this.state.close()

    if (!this.needsFlush && this.state.depth === 0) {
      this.state.buffer = []
    }
  }

  handleDisabled(disabled?: boolean): void {
    for (const key of Object.keys(this.fields)) {
      const field = get(this.fields, key)

      if (field == null) {
        continue
      }

      const { _f, ...currentField } = field

      if (_f) {
        if (_f.refs && _f.refs[0]) {
          this.handleDisabledAction(_f.refs[0], key, disabled)
        } else if (_f.ref) {
          this.handleDisabledAction(_f.ref, key, disabled)
        } else {
          iterateFieldsByAction(currentField, (ref, name) =>
            this.handleDisabledAction(ref, name, disabled),
          )
        }
      } else if (isObject(currentField)) {
        iterateFieldsByAction(currentField, (ref, name) =>
          this.handleDisabledAction(ref, name, disabled),
        )
      }
    }
  }

  handleDisabledAction(ref: FieldElement, name: string, disabled?: boolean): void {
    const inputRef = ref as HTMLInputElement

    const currentField = get(this.fields, name)

    const requiredDisabledState =
      disabled || (typeof currentField?._f.disabled === 'boolean' && currentField._f.disabled)

    inputRef.disabled = requiredDisabledState
  }

  mount(): void {
    this.mounted = true
  }

  unmount(): void {
    this.cleanup()
    this.mounted = false
  }

  cleanup(): void {
    this.removeUnmounted()
  }

  /**
   * Unregister an element from the form control.
   */
  unregisterField<T extends keyof ParseForm<TFieldValues>>(
    name: LiteralUnion<T, string>,
    options?: RegisterOptions<TFieldValues, T>,
  ): void {
    const field: Field | undefined = get(this.fields, name)

    if (field?._f) {
      field._f.mount = false
    }

    const shouldUnregister = this.options.shouldUnregister || options?.shouldUnregister
    const isFieldArrayInProgress = this.names.array.has(name.toString()) && this.action.value

    if (shouldUnregister && !isFieldArrayInProgress) {
      this.names.unMount.add(name.toString())
    }
  }

  /**
   * Check this before updating the errors value after a validation.
   * Will prevent race conditions.
   */
  isFieldValueUpdated(name?: PropertyKey, fieldValue?: any) {
    return Number.isNaN(fieldValue) || fieldValue === get(this._formValues, name, fieldValue)
  }
}
