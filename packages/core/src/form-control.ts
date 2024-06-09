import { Batchable, Writable } from '@forms.js/common/store'

import { cloneObject } from '@forms.js/common/utils/clone-object'
import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { deepFilter } from '@forms.js/common/utils/deep-filter'
import { set } from '@forms.js/common/utils/set'
import { unset } from '@forms.js/common/utils/unset'
import { isBrowser } from '@forms.js/common/utils/is-browser'
// import { isObject } from '@forms.js/common/utils/is-object'
import { isEmptyObject } from '@forms.js/common/utils/is-empty-object'
import { isPrimitive } from '@forms.js/common/utils/is-primitive'
import type { Nullish } from '@forms.js/common/utils/null'
import { get, getMultiple } from '@forms.js/common/utils/get'
// import { stringToPath } from '@forms.js/common/utils/string-to-path'
import { toStringArray } from '@forms.js/common/utils/to-string-array'
import {
  VALIDATION_EVENTS,
  type CriteriaMode,
  type RevalidationEvent,
  type SubmissionValidationMode,
  type ValidationEvent,
} from './constants'
// import { lookupError } from './logic/errors/lookup-error'
import { filterFields } from './logic/fields/filter-fields'
import { focusFieldBy } from './logic/fields/focus-field-by'
// import { getFieldEventValue } from './logic/fields/get-field-event-value'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import { /* getFieldValue, */ getFieldValueAs } from './logic/fields/get-field-value'
// import { hasValidation } from './logic/fields/has-validation'
// import { iterateFieldsByAction } from './logic/fields/iterate-fields-by-action'
import { updateFieldReference } from './logic/fields/update-field-reference'
// import { elementIsLive } from './logic/html/element-is-live'
import { isHTMLElement } from './logic/html/is-html-element'
// import { mergeElementWithField } from './logic/html/merge-element-with-field'
import { getValidationModes } from './logic/validation/get-validation-modes'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
// import { shouldSkipValidationAfter } from './logic/validation/should-skip-validation-after'
import type { FieldErrorRecord, FieldErrors } from './types/errors'
import type { /* HTMLFieldElement ,*/ Field, FieldRecord } from './types/fields'
import type { ParseForm } from './types/parse'
import type { Resolver } from './types/resolver'
import type { DeepMap } from './utils/deep-map'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults, ValueOrDeepPartial } from './utils/defaults'
// import type { KeysToProperties } from './utils/keys-to-properties'
// import type { LiteralUnion } from './utils/literal-union'

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
  defaultValues: DeepPartial<T>
  errors: FieldErrors<T>
  values: T
}

export type FieldState = {
  invalid: boolean
  isDirty: boolean
  isTouched: boolean
  error?: FieldErrors[string]
}

export type FormControlOptions<TValues = Record<string, any>, TContext = any> = {
  mode?: ValidationEvent[keyof ValidationEvent]
  revalidateMode?: RevalidationEvent[keyof RevalidationEvent]
  disabled?: boolean
  context?: TContext
  defaultValues?: Defaults<TValues>
  values?: TValues
  resetOptions?: ResetOptions
  resolver?: Resolver<TValues, TContext>
  shouldFocusError?: boolean
  shouldUnregister?: boolean
  shouldUseNativeValidation?: boolean
  progressive?: boolean
  criteriaMode?: CriteriaMode[keyof CriteriaMode]
  delayError?: number
}

export type ResolvedFormControlOptions<TValues, TContext> = FormControlOptions<
  TValues,
  TContext
> & {
  shouldDisplayAllAssociatedErrors: boolean
  submissionValidationMode: SubmissionValidationMode
  shouldCaptureDirtyFields: boolean
}

export type UpdateDisabledFieldOptions = {
  name: string
  disabled?: boolean
  field?: Field
  fields?: FieldRecord
}

export type SetFocusOptions = {
  shouldSelect?: boolean
}

export type TriggerOptions = {
  shouldFocus?: boolean
  shouldSetErrors?: boolean
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

export interface UnregisterOptions extends KeepStateOptions {
  keepValue?: boolean
  keepDefaultValue?: boolean
  keepError?: boolean
}

export type SetValueOptions = {
  shouldValidate?: boolean
  shouldDirty?: boolean
  shouldTouch?: boolean
  quiet?: boolean
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
  revalidateMode: VALIDATION_EVENTS.onChange,

  /**
   * If an error is found during validation, the first field with an error is focused.
   */
  shouldFocusError: true,
}

/**
 * Core API.
 */
export class FormControl<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  // TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
> {
  /**
   * Internally resolved options that control the form control's behavior.
   */
  options: ResolvedFormControlOptions<TValues, TContext>

  /**
   * State represented as a record of writable stores.
   *
   * This is not optimized for notifications; it may change multiple times in a function.
   */
  stores: { [K in keyof FormControlState<TValues>]: Writable<FormControlState<TValues>[K]> }

  /**
   * Buffers updates to {@link stores} until it's flushed.
   *
   * This is optimized for notifications and generally flushes 1-2 times per function.
   */
  state: Batchable<this['stores']>

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
   */
  valueListeners: ((newValues: TValues) => unknown)[] = []

  mounted = false

  /**
   * Internal timeoutId for debouncing.
   */
  timeoutId = 0

  constructor(options?: FormControlOptions<TValues, TContext>) {
    const mode = options?.mode ?? defaultFormControlOptions.mode
    const revalidateMode = options?.revalidateMode ?? defaultFormControlOptions.revalidateMode

    /**
     * Merge the default options and derive additional configuration options for the form.
     */
    this.options = {
      mode,
      revalidateMode,
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
      defaultValues: new Writable(defaultValues),
      errors: new Writable({}),
      values: new Writable(options?.shouldUnregister ? {} : cloneObject(defaultValues)),
      disabled: new Writable(Boolean(options?.disabled)),
    }

    this.state = new Batchable(this.stores, new Set())

    if (isLoading) {
      this.resolveDefaultValues(initialDefaultValues, true)
    }
  }

  //--------------------------------------------------------------------------------------
  // Top-level getters.
  //--------------------------------------------------------------------------------------

  getValues<T extends keyof TParsedForm>(fieldNames?: T | Readonly<T>[] | T[]) {
    const values = {
      ...(this.mounted ? this.state.value.values : this.state.value.defaultValues),
    }

    return fieldNames == null
      ? values
      : typeof fieldNames === 'string'
      ? get(values, fieldNames)
      : getMultiple(values, fieldNames)
  }

  /**
   * Evaluate whether the current form values are different from the default values.
   */
  getDirty(name?: string, data?: any): boolean {
    if (name && data) {
      this.stores.values.update((values) => {
        set(values, name, data)
        return values
      })
    }
    return !deepEqual(this.getValues(), this.stores.defaultValues.value)
  }

  //--------------------------------------------------------------------------------------
  // Setup.
  //--------------------------------------------------------------------------------------

  /**
   * Resolve default values.
   *
   * Can be synchronous or asynchronous depending on the default values provided.
   */
  resolveDefaultValues(defaults?: Defaults<TValues>, resetValues?: boolean): void | Promise<void> {
    const resolvingDefaultValues = typeof defaults === 'function' ? defaults() : defaults

    if (resolvingDefaultValues == null) {
      this.stores.isLoading.set(false)
      return
    }

    const isPromise = resolvingDefaultValues instanceof Promise

    // The store will not notify subscribers if `isPromise` is the same as `isLoading`.
    this.stores.isLoading.set(isPromise)

    if (isPromise) {
      resolvingDefaultValues.then((resolvedDefaultValues = {} as any) => {
        this.finalizeResolveDefaultValues(resolvedDefaultValues, resetValues)
      })
      return
    }

    const resolvedDefaultValues = resolvingDefaultValues ?? {}

    this.finalizeResolveDefaultValues(resolvedDefaultValues, resetValues)
  }

  /**
   * Always finalize the resolution of default values synchronously.
   */
  finalizeResolveDefaultValues(
    resolvedDefaultValues: ValueOrDeepPartial<TValues>,
    resetValues?: boolean,
  ) {
    this.state.open()

    this.stores.defaultValues.set(resolvedDefaultValues as any)

    if (resetValues) {
      this.stores.values.set(cloneObject(resolvedDefaultValues) as TValues)
    }

    this.stores.isLoading.set(false)

    this.state.flush()
  }

  //--------------------------------------------------------------------------------------
  // Interactions.
  //--------------------------------------------------------------------------------------

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
   * Reset the form control.
   */
  reset(
    formValues?: Defaults<TValues> extends TValues ? TValues : Defaults<TValues>,
    options?: ResetOptions,
  ): void {
    this.state.open()

    const updatedValues = formValues ? cloneObject(formValues) : this.stores.defaultValues.value

    const isEmptyResetValues = isEmptyObject(formValues)

    const cloneUpdatedValues = cloneObject(updatedValues)

    const values = isEmptyResetValues ? this.stores.defaultValues.value : cloneUpdatedValues

    if (!options?.keepDefaultValues) {
      this.stores.defaultValues.set(updatedValues as DeepPartial<TValues>)
    }

    if (!options?.keepValues) {
      if (options?.keepDirtyValues) {
        this.setDirtyValues(values)
      } else {
        if (isBrowser && formValues == null) {
          this.resetFormElement()
        }
        this.fields = {}
      }

      const newValues = this.options.shouldUnregister
        ? options?.keepDefaultValues
          ? cloneObject(this.stores.defaultValues.value)
          : {}
        : cloneObject(values)

      this.stores.values.set(newValues as TValues, true)
    }

    this.names = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
    }

    this.mounted =
      !this.state.value.isValid ||
      Boolean(options?.keepIsValid) ||
      Boolean(options?.keepDirtyValues)

    if (!options?.keepSubmitCount) {
      this.stores.submitCount.set(0)
    }

    // What is _state.watch, and do I need to update it?

    if (!options?.keepDirty) {
      const isDirty = isEmptyResetValues
        ? false
        : options?.keepDirty
        ? undefined
        : Boolean(
            options?.keepDefaultValues &&
              !deepEqual(this.state.value.values, this.state.value.defaultValues),
          )

      if (isDirty != null) {
        this.stores.isDirty.set(isDirty)
      }
    }

    if (!options?.keepIsSubmitted) {
      this.stores.isSubmitted.set(false)
    }

    if (options?.keepDirtyValues) {
      if (options?.keepDefaultValues && this.state.value.values) {
        const dirtyFields = getDirtyFields(this.state.value.defaultValues, this.state.value.values)
        this.stores.dirtyFields.set(dirtyFields)
      }
    } else if (options?.keepDefaultValues && this.state.value.values) {
      const dirtyFields = getDirtyFields(this.state.value.defaultValues, formValues)
      this.stores.dirtyFields.set(dirtyFields)
    } else {
      this.stores.dirtyFields.set({})
    }

    if (!options?.keepTouched) {
      this.stores.touchedFields.set({})
    }

    if (!options?.keepErrors) {
      this.stores.errors.set({})
    }

    if (!options?.keepIsSubmitSuccessful) {
      this.stores.isSubmitSuccessful.set(false)
    }

    this.stores.isSubmitting.set(false)

    this.valueListeners.forEach((listener) => listener(this.stores.values.value))

    this.state.flush(true)
  }

  /**
   * Resets the nearest {@link HTMLFormElement}.
   */
  resetFormElement(): void {
    for (const name of this.names.mount) {
      const field: Field | undefined = get(this.fields, name)

      if (field?._f == null) continue

      const fieldReference = Array.isArray(field._f.refs) ? field._f.refs[0] : field._f.ref

      if (!isHTMLElement(fieldReference)) continue

      const form = fieldReference.closest('form')

      if (form) {
        form.reset()
        break
      }
    }
  }

  /**
   * Updates the form's values based on its dirty fields.
   */
  setDirtyValues(values: unknown): void {
    for (const fieldName of this.names.mount) {
      if (get(this.stores.dirtyFields.value, fieldName)) {
        set(values, fieldName, get(this.stores.values.value, fieldName))
      } else {
        this.setValue(fieldName as any, get(values, fieldName))
      }
    }
  }

  /**
   * Set a specific field's value.
   */
  setValue<T extends keyof TParsedForm>(
    name: Extract<T, string>,
    value: TParsedForm[T],
    options?: SetValueOptions,
  ): void {
    const field: Field | undefined = get(this.fields, name)
    const isFieldArray = this.names.array.has(name)
    const clonedValue = cloneObject(value)

    this.state.open()

    this.stores.values.update((values) => {
      set(values, name, clonedValue)
      return values
    })

    if (isFieldArray) {
      this.state.flush()
      this.state.open()

      if (this.isTracking('isDirty') || (this.isTracking('dirtyFields') && options?.shouldDirty)) {
        const dirtyFields = getDirtyFields(this.state.value.defaultValues, this.state.value.values)
        this.stores.dirtyFields.set(dirtyFields)

        const isDirty = this.getDirty(name, clonedValue)
        this.stores.isDirty.set(isDirty)

        this.state.flush()
        this.state.open()
      }
    } else {
      if (field && !field._f && clonedValue != null) {
        this.setValues(name, clonedValue, { quiet: true, ...options })
      } else {
        this.setFieldValue(name, clonedValue, options)
      }
    }

    this.stores.values.update((values) => ({ ...values }), [name])

    this.valueListeners.forEach((listener) => listener(this.stores.values.value))

    this.state.flush()
  }

  /**
   * Set multiple field values, i.e. for a field array.
   */
  setValues(name: string, value: any, options?: SetValueOptions) {
    this.state.open()

    for (const fieldKey in value) {
      const fieldValue = value[fieldKey]
      const fieldName = `${name}.${fieldKey}`
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
   * Attempt to directly set a field's "value" property.
   */
  setFieldValue(name: string, value: unknown, options?: SetValueOptions) {
    const field: Field | undefined = get(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    updateFieldReference(fieldReference, fieldValue)

    if (!fieldReference.disabled) {
      set(this.stores.values.value, name, getFieldValueAs(value, fieldReference))
    }

    this.touch(name, fieldValue, options)

    if (options?.shouldValidate) {
      this.trigger(name as any, { shouldSetErrors: true })
    }
  }

  /**
   * Touch a field.
   */
  touch(name: string, value?: unknown, options?: SetValueOptions): void {
    if (!options?.shouldTouch || options.shouldDirty) {
      this.updateDirtyField(name, value)
    }

    if (options?.shouldTouch) {
      this.updateTouchedField(name)
    }
  }

  /**
   * Update a field's "touched" property.
   */
  updateTouchedField(name: string): boolean {
    const previousIsTouched = get(this.stores.touchedFields.value, name)

    if (!previousIsTouched) {
      this.stores.touchedFields.update(
        (touchedFields) => {
          set(touchedFields, name, true)
          return touchedFields
        },
        [name],
      )
    }

    return !previousIsTouched
  }

  /**
   * Update a field's dirty status.
   */
  updateDirtyField(name: string, value?: unknown): boolean {
    const defaultValue = get(this.stores.defaultValues.value, name)

    const currentIsDirty = !deepEqual(defaultValue, value)

    const previousIsDirty = Boolean(get(this.stores.dirtyFields.value, name))

    if (previousIsDirty && !currentIsDirty) {
      this.stores.dirtyFields.update(
        (dirtyFields) => {
          unset(dirtyFields, name)
          return dirtyFields
        },
        [name],
      )
    }

    if (!previousIsDirty && currentIsDirty) {
      this.stores.dirtyFields.update(
        (dirtyFields) => {
          set(dirtyFields, name, true)
          return dirtyFields
        },
        [name],
      )
    }

    if (this.isTracking('isDirty', [name])) {
      this.stores.isDirty.set(this.getDirty(), [name])
    }

    return currentIsDirty !== previousIsDirty
  }

  /**
   * Trigger a field.
   */
  async trigger<T extends keyof TParsedForm>(
    name?: T | T[] | readonly T[],
    options?: TriggerOptions,
  ): Promise<boolean> {
    const fieldNames = toStringArray(name)

    this.stores.isValidating.set(true, fieldNames)

    this.state.open()

    const result = await this.validate(name as any)

    if (result.validationResult) {
      this.mergeErrors(result.validationResult.errors, result.validationResult.names)
    }

    if (result.resolverResult?.errors) {
      this.mergeErrors(result.resolverResult.errors)
    }

    this.stores.isValid.set(result.isValid, fieldNames)

    this.stores.isValidating.set(false, fieldNames)

    if (options?.shouldFocus && !result.isValid) {
      focusFieldBy(
        this.fields,
        (key?: string) => key && get(this.stores.errors.value, key),
        name ? fieldNames : this.names.mount,
      )
    }

    this.state.flush()

    return result.isValid
  }

  /**
   * Merge provided errors the form state's existing errors.
   */
  mergeErrors(errors: FieldErrors<TValues> | FieldErrorRecord, names?: string[]): void {
    const namesToMerge = names ?? Object.keys(errors)

    this.stores.errors.update((currentErrors) => {
      const newErrors = names?.length ? currentErrors : {}

      namesToMerge.forEach((name) => {
        const fieldError = get(errors, name)

        if (fieldError == null) {
          unset(newErrors, name)
          return
        }

        if (!this.names.array.has(name)) {
          set(newErrors, name, fieldError)
          return
        }

        const fieldArrayErrors = get(currentErrors, name) ?? {}

        set(fieldArrayErrors, 'root', errors[name])

        set(newErrors, name, fieldArrayErrors)
      })

      return newErrors
    }, namesToMerge)
  }

  /**
   * Validate the form.
   */
  async validate(name?: string | string[] | Nullish) {
    const nameArray = toStringArray(name)

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate(nameArray)

      const isValid = validationResult.valid

      return { validationResult, isValid }
    }

    const names = nameArray ?? Array.from(this.names.mount)

    const fields = filterFields(names, this.fields)

    const resolverResult = await this.options.resolver(
      this.stores.values.value,
      this.options.context,
      {
        names: names as any,
        fields,
        criteriaMode: this.options.criteriaMode,
        shouldUseNativeValidation: this.options.shouldUseNativeValidation,
      },
    )

    const isValid = resolverResult.errors == null || isEmptyObject(resolverResult.errors)

    return { resolverResult, isValid }
  }

  /**
   * Natively validate the form control's values.
   */
  async nativeValidate(
    names?: string | string[],
    shouldOnlyCheckValid?: boolean,
  ): Promise<NativeValidationResult> {
    const fields = deepFilter(this.fields, names)

    const validationResult = await nativeValidateFields(fields, this.stores.values.value, {
      shouldOnlyCheckValid,
      shouldUseNativeValidation: this.options.shouldUseNativeValidation,
      shouldDisplayAllAssociatedErrors: this.options.shouldDisplayAllAssociatedErrors,
      isFieldArrayRoot: (name) => this.names.array.has(name),
    })

    return validationResult
  }

  //--------------------------------------------------------------------------------------
  // Utilities.
  //--------------------------------------------------------------------------------------

  /**
   * Whether the form control is currently tracking a specific state property.
   *
   * {@link state} does not trigger updates for untracked properties.
   */
  isTracking(key: keyof typeof this.stores, name?: string[]): boolean {
    return (
      this.state.isTracking(key, name) ||
      this.state.childIsTracking(key, name) ||
      this.stores[key].subscribers.size > 1
    )
  }

  debounce<T extends Function>(callback: T) {
    return (timeout: number) => {
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(callback, timeout)
    }
  }
}
