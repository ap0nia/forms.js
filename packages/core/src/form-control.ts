import { Batchable, Writable } from '@forms.js/common/store'
import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { deepFilter } from '@forms.js/common/utils/deep-filter'
import { deepSet } from '@forms.js/common/utils/deep-set'
import { deepUnset } from '@forms.js/common/utils/deep-unset'
import { isBrowser } from '@forms.js/common/utils/is-browser'
import { isEmptyObject } from '@forms.js/common/utils/is-object'
import { isPrimitive } from '@forms.js/common/utils/is-primitive'
import type { Nullish } from '@forms.js/common/utils/null'
import { safeGet, safeGetMultiple } from '@forms.js/common/utils/safe-get'
import { toStringArray } from '@forms.js/common/utils/to-string-array'

import { INPUT_EVENTS, VALIDATION_EVENTS } from './constants'
import { lookupError } from './logic/errors/lookup-error'
import { filterFields } from './logic/fields/filter-fields'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getCurrentFieldValue } from './logic/fields/get-current-field-value'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import { getFieldValue, getFieldValueAs } from './logic/fields/get-field-value'
import { hasValidation } from './logic/fields/has-validation'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { elementIsLive } from './logic/html/element-is-live'
import { isHTMLElement } from './logic/html/is-html-element'
import { mergeElementWithField } from './logic/html/merge-element-with-field'
import { getValidationMode } from './logic/validation/get-validation-mode'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { shouldSkipValidationAfter } from './logic/validation/should-skip-validation-after'
import type { ErrorOption, FieldErrorRecord, FieldErrors } from './types/errors'
import type { Field, FieldRecord } from './types/fields'
import type {
  FieldState,
  FormControlOptions,
  FormControlState,
  HandlerCallback,
  ParseForm,
  ResetOptions,
  ResolvedFormControlOptions,
  SetValueOptions,
  SubmitErrorHandler,
  SubmitHandler,
  TriggerOptions,
  UnregisterOptions,
  UpdateDisabledFieldOptions,
  WatchOptions,
} from './types/form'
import type { InputElement } from './types/html'
import type { RegisterOptions } from './types/register'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults } from './utils/defaults'
import type { KeysToProperties } from './utils/keys-to-properties'
import type { LiteralUnion } from './utils/literal-union'

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
 */
export class FormControl<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
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

  constructor(options?: FormControlOptions<TValues, TContext>) {
    const mode = options?.mode ?? defaultFormControlOptions.mode
    const reValidateMode = options?.reValidateMode ?? defaultFormControlOptions.reValidateMode

    this.options = {
      mode,
      reValidateMode,
      shouldFocusError: defaultFormControlOptions.shouldFocusError,
      shouldDisplayAllAssociatedErrors: options?.criteriaMode === VALIDATION_EVENTS.all,
      submissionValidationMode: {
        beforeSubmission: getValidationMode(mode),
        afterSubmission: getValidationMode(reValidateMode),
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
      (!isLoading && structuredClone(initialDefaultValues)) ||
      structuredClone(options?.values ?? {})

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
      values: new Writable(options?.shouldUnregister ? {} : structuredClone(defaultValues)),
      disabled: new Writable(Boolean(options?.disabled)),
    }

    this.state = new Batchable(this.stores, new Set())

    if (isLoading) {
      this.resolveDefaultValues(initialDefaultValues, true)
    }
  }

  //--------------------------------------------------------------------------------------
  // Getters.
  //--------------------------------------------------------------------------------------

  /**
   * Evaluate whether the current form values are different from the default values.
   */
  getDirty(): boolean {
    return !deepEqual(this.stores.defaultValues.value, this.stores.values.value)
  }

  /**
   * Get the current state of a field.
   */
  getFieldState(name: string, formState?: FormControlState<TValues>): FieldState {
    const errors = formState?.errors ?? this.stores.errors.value
    const dirtyFields = formState?.dirtyFields ?? this.stores.dirtyFields.value
    const touchedFields = formState?.touchedFields ?? this.stores.touchedFields.value

    return {
      invalid: Boolean(safeGet(errors, name)),
      isDirty: Boolean(safeGet(dirtyFields, name)),
      isTouched: Boolean(safeGet(touchedFields, name)),
      error: safeGet(errors, name),
    }
  }

  /**
   * Get all the form values when no argument is supplied to this function.
   */
  getValues(): TValues

  /**
   * Get the value of a single field when the field name is provided.
   */
  getValues<T extends TParsedForm['keys']>(field: T): TParsedForm['values'][T]

  /**
   * Get the values of multiple fields when an array of field names is provided.
   */
  getValues<T extends TParsedForm['keys'][]>(fields: T): KeysToProperties<TParsedForm['values'], T>

  /**
   * Get the values of multiple fields when field names are provided as rest arguments.
   */
  getValues<T extends TParsedForm['keys'][]>(
    ...fields: T
  ): KeysToProperties<TParsedForm['values'], T>

  /**
   * Implementation.
   */
  getValues(...args: any[]): any {
    const names = args.length > 1 ? args : args[0]
    return safeGetMultiple(this.stores.values.value, names)
  }

  /**
   * Makes {@link state} subscribe to all updates to values for all field names.
   */
  watch(): TValues

  /**
   * Subscribe to all updates to {@link state}.
   */
  watch(callback: (data: any, context: { name?: string; type?: string }) => void): () => void

  /**
   * Makes {@link state} subscribe to all updates to values for a specific field name.
   */
  watch<T extends TParsedForm['keys']>(
    name: T,
    defaultValues?: DeepPartial<TValues>,
    options?: WatchOptions<TValues>,
  ): TParsedForm['values'][T]

  /**
   * Makes {@link state} subscribe to all updates to values for multiple field names.
   */
  watch<T extends TParsedForm['keys'][]>(
    name: T,
    defaultValues?: DeepPartial<TParsedForm['values']>,
    options?: WatchOptions<TValues>,
  ): KeysToProperties<TParsedForm['values'], T>

  /**
   * Implementation.
   *
   * Although this function can't re-run itself and isn't a subscription,
   * this works in React because {@link state} will initialize the re-render,
   * causing the component to re-run this function and evaluate new watched values.
   */
  watch(...args: any[]): any {
    if (typeof args[0] === 'function') {
      return this.state.subscribe((state, context) => {
        return args[0](state, context ?? this.options.context)
      })
    }

    const [name, defaultValue, options] = args

    const nameArray = Array.isArray(name) ? name : name ? [name] : []

    if (nameArray.length > 0) {
      this.state.track('values', nameArray, options)
    } else {
      this.state.keys?.add('values')
    }

    return this.getWatchOutput(name, defaultValue, nameArray)
  }

  getWatchOutput(
    name: string | string[],
    defaultValue: unknown,
    nameArray = toStringArray(name),
  ): any {
    const values = this.mounted
      ? this.stores.values.value
      : defaultValue == null
      ? this.stores.defaultValues.value
      : typeof name === 'string'
      ? { [name]: defaultValue }
      : defaultValue

    return nameArray.length > 1
      ? deepFilter({ ...values }, nameArray)
      : safeGet({ ...values }, nameArray[0])
  }

  //--------------------------------------------------------------------------------------
  // Core API.
  //--------------------------------------------------------------------------------------

  /**
   * Register an element with the form control.
   */
  registerElement<T extends TParsedForm['keys']>(
    name: Extract<T, string>,
    element: InputElement,
    options?: RegisterOptions<TValues, T>,
  ): void {
    this.state.open()

    const field = this.registerField(name, options)

    const fieldNames = toStringArray(name)

    const newField = mergeElementWithField(name, field, element)

    const defaultValue =
      safeGet(this.stores.values.value, name) ?? safeGet(this.stores.defaultValues.value, name)

    if (defaultValue == null || (newField._f.ref as HTMLInputElement)?.defaultChecked) {
      this.stores.values.update((values) => {
        deepSet(values, name, getFieldValue(newField._f))
        return values
      })
    } else {
      updateFieldReference(newField._f, defaultValue)
    }

    deepSet(this.fields, name, newField)

    this.updateValid(undefined, fieldNames)

    this.state.close()
  }

  /**
   * Register a field with the form control.
   */
  registerField<T extends TParsedForm['keys']>(
    name: Extract<T, string>,
    options?: RegisterOptions<TValues, T>,
  ) {
    this.state.open()

    const existingField: Field | undefined = safeGet(this.fields, name)

    const field: Field = {
      ...existingField,
      _f: {
        ...(existingField?._f ?? { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    }

    deepSet(this.fields, name, field)

    this.names.mount.add(name)

    if (existingField) {
      this.updateDisabledField({ field, disabled: options?.disabled, name })
    } else {
      const defaultValue =
        safeGet(this.stores.values.value, name) ??
        options?.value ??
        safeGet(this.stores.defaultValues.value, name)

      this.stores.values.update((values) => {
        deepSet(values, name, defaultValue)
        return values
      })
    }

    this.state.close()

    return field
  }

  /**
   * Unregister an element from the form control.
   */
  unregisterElement<T extends TParsedForm['keys']>(
    name: LiteralUnion<T, string>,
    options?: RegisterOptions<TValues, T>,
  ): void {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f) {
      field._f.mount = false
    }

    const shouldUnregister = options?.shouldUnregister ?? this.options.shouldUnregister

    if (shouldUnregister && !this.names.array.has(name)) {
      this.names.unMount.add(name)
    }
  }

  /**
   * Unregister a field from the form control.
   */
  unregisterField<T extends TParsedForm['keys']>(
    name?: T | T[],
    options?: UnregisterOptions,
    force = true,
  ): void {
    const keepValue = options?.keepValue ?? this.options.resetOptions?.keepValues
    const keepError = options?.keepError ?? this.options.resetOptions?.keepErrors
    const keepDirty = options?.keepDirty ?? this.options.resetOptions?.keepDirty
    const keepTouched = options?.keepTouched ?? this.options.resetOptions?.keepTouched
    const keepDefaultValues = options?.keepDefaultValue ?? this.options.shouldUnregister
    const keepIsValid = options?.keepIsValid ?? this.options.resetOptions?.keepIsValid

    this.state.open()

    const fieldNames = toStringArray(name) ?? Array.from(this.names.mount)

    for (const fieldName of fieldNames) {
      this.names.mount.delete(fieldName)
      this.names.array.delete(fieldName)

      if (!keepValue) {
        deepUnset(this.fields, fieldName)

        this.stores.values.update((values) => {
          deepUnset(values, fieldName)
          return values
        }, fieldNames)
      }

      if (!keepError) {
        this.stores.errors.update((errors) => {
          deepUnset(errors, fieldName)
          return errors
        }, fieldNames)
      }

      if (!keepDirty) {
        this.stores.dirtyFields.update((dirtyFields) => {
          deepUnset(dirtyFields, fieldName)
          return dirtyFields
        }, fieldNames)

        this.stores.isDirty.set(this.getDirty(), fieldNames)
      }

      if (!keepTouched) {
        this.stores.touchedFields.update((touchedFields) => {
          deepUnset(touchedFields, fieldName)
          return touchedFields
        }, fieldNames)
      }

      if (!keepDefaultValues) {
        this.stores.defaultValues.update((defaultValues) => {
          deepUnset(defaultValues, fieldName)
          return defaultValues
        }, fieldNames)
      }
    }

    if (!keepIsValid) {
      this.updateValid(undefined, fieldNames)
    }

    this.state.flush(force)
  }

  /**
   * Handle a change event.
   */
  async handleChange(event: Event): Promise<void> {
    const name = (event.target as HTMLInputElement)?.name

    const field: Field | undefined = safeGet(this.fields, name)

    if (field == null) {
      return
    }

    const fieldValue = getCurrentFieldValue(event, field)

    this.state.open()

    this.stores.values.update(
      (values) => {
        deepSet(values, name, fieldValue)
        return values
      },
      [name],
    )

    const isBlurEvent = event.type === INPUT_EVENTS.BLUR || event.type === INPUT_EVENTS.FOCUS_OUT

    if (isBlurEvent) {
      field._f.onBlur?.(event)
    } else {
      field._f.onChange?.(event)
    }

    if (isBlurEvent) {
      this.updateTouchedField(name)
    } else {
      this.updateDirtyField(name, fieldValue)
    }

    const nothingToValidate =
      !hasValidation(field._f) &&
      !this.options.resolver &&
      !safeGet(this.stores.errors.value, name) &&
      !field._f.deps

    const shouldSkipValidation =
      nothingToValidate || this.shouldSkipValidationAfter(name, isBlurEvent)

    if (shouldSkipValidation) {
      this.updateValid()
      this.state.flush()
      return
    }

    if (!isBlurEvent) {
      this.state.flush()
      this.state.open()
    }

    this.state.transaction(() => {
      this.stores.isValidating.set(true)
    })

    const result = await this.validate(name)

    if (result.resolverResult) {
      const previousError = lookupError(this.stores.errors.value, this.fields, name)

      const currentError = lookupError(
        result.resolverResult.errors ?? {},
        this.fields,
        previousError.name,
      )

      this.stores.errors.update((errors) => {
        if (currentError.error) {
          deepSet(errors, currentError.name, currentError.error)
        } else {
          deepUnset(errors, currentError.name)
        }
        return errors
      })

      if (field._f.deps) {
        await this.trigger(field._f.deps as any)
      } else {
        this.stores.isValid.set(result.isValid, [name])
      }
    }

    if (result.validationResult) {
      const isFieldValueUpdated =
        Number.isNaN(fieldValue) ||
        (fieldValue === safeGet(this.stores.values.value, name) ?? fieldValue)

      if (!result.isValid) {
        const error = result.validationResult.errors[name]

        if (isFieldValueUpdated && !error) {
          const fullResult = await this.validate()

          if (fullResult.validationResult?.errors) {
            this.mergeErrors(fullResult.validationResult.errors, fullResult.validationResult.names)
          }
        } else {
          this.stores.errors.update(
            (errors) => {
              deepSet(errors, name, error)
              return errors
            },
            [name],
          )
        }
      } else {
        this.mergeErrors(result.validationResult.errors, result.validationResult.names)
      }

      if (isFieldValueUpdated && field._f.deps) {
        await this.trigger(field._f.deps as any)
      } else {
        this.stores.isValid.set(result.isValid, [name])
      }
    }

    this.stores.isValidating.set(false, [name])

    this.state.flush()
  }

  /**
   * Handle a submit event.
   *
   * @returns A submission event handler.
   */
  handleSubmit(
    onValid?: SubmitHandler<TValues, TTransformedValues>,
    onInvalid?: SubmitErrorHandler<TValues>,
  ): HandlerCallback {
    return async (event) => {
      event?.preventDefault?.()

      this.state.open()

      this.stores.isSubmitting.set(true)

      const { isValid, resolverResult, validationResult } = await this.validate()

      const errors = resolverResult?.errors ?? validationResult?.errors ?? {}

      this.stores.errors.update((errors) => {
        deepUnset(errors, 'root')
        return errors
      }, true)

      this.mergeErrors(errors)

      if (isValid) {
        const data = structuredClone(resolverResult?.values ?? this.stores.values.value) as any
        await onValid?.(data, event)
      } else {
        await onInvalid?.(errors, event)
        this.focusError()
        setTimeout(this.focusError.bind(this))
      }

      this.stores.isSubmitted.set(true, true)
      this.stores.isSubmitting.set(false, true)
      this.stores.isSubmitSuccessful.set(isEmptyObject(this.stores.errors.value), true)
      this.stores.submitCount.update((count) => count + 1, true)

      this.state.flush()
    }
  }

  /**
   * Trigger a field.
   */
  async trigger<T extends TParsedForm['keys']>(
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
        (key?: string) => key && safeGet(this.stores.errors.value, key),
        name ? fieldNames : this.names.mount,
      )
    }

    this.state.flush()

    return result.isValid
  }

  //--------------------------------------------------------------------------------------
  // Values.
  //--------------------------------------------------------------------------------------

  /**
   * Set a specific field's value.
   */
  setValue<T extends TParsedForm['keys']>(
    name: T,
    value: TParsedForm['values'][T],
    options?: SetValueOptions,
  ): void {
    const field: FieldRecord[T] = safeGet(this.fields, name)

    const fieldNames = toStringArray(name)

    const clonedValue = structuredClone(value)

    this.state.open()

    this.stores.values.update((values) => {
      deepSet(values, name, clonedValue)
      return values
    })

    const isFieldArray = this.names.array.has(name)

    if (!isFieldArray) {
      if (field && !field._f && clonedValue != null) {
        this.setValues(name, clonedValue, { quiet: true, ...options })
      } else {
        this.setFieldValue(name, clonedValue, options)
      }
    } else if (options?.shouldDirty) {
      this.stores.dirtyFields.set(
        getDirtyFields(this.stores.defaultValues.value, this.stores.values.value),
      )
      this.stores.isDirty.set(this.getDirty())
    }

    this.stores.values.update((values) => ({ ...values }), fieldNames)

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
      const field: Field | undefined = safeGet(this.fields, fieldName)

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
   * Updates the form's values based on its dirty fields.
   */
  setDirtyValues(values: unknown): void {
    for (const fieldName of this.names.mount) {
      if (safeGet(this.stores.dirtyFields.value, fieldName)) {
        deepSet(values, fieldName, safeGet(this.stores.values.value, fieldName))
      } else {
        this.setValue(fieldName as any, safeGet(values, fieldName))
      }
    }
  }

  /**
   * Attempt to directly set a field's "value" property.
   */
  setFieldValue(name: string, value: unknown, options?: SetValueOptions) {
    const field: Field | undefined = safeGet(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    updateFieldReference(fieldReference, fieldValue)

    if (!fieldReference.disabled) {
      deepSet(this.stores.values.value, name, getFieldValueAs(value, fieldReference))
    }

    this.touch(name, fieldValue, options)

    if (options?.shouldValidate) {
      this.trigger(name as any, { shouldSetErrors: true })
    }
  }

  //--------------------------------------------------------------------------------------
  // Dirty, touched, disabled.
  //--------------------------------------------------------------------------------------

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
    const previousIsTouched = safeGet(this.stores.touchedFields.value, name)

    if (!previousIsTouched) {
      this.stores.touchedFields.update(
        (touchedFields) => {
          deepSet(touchedFields, name, true)
          return touchedFields
        },
        [name],
      )
    }

    return !previousIsTouched
  }

  /**
   * Update a field's disabled status.
   */
  updateDisabledField(options: UpdateDisabledFieldOptions): void {
    if (typeof options.disabled !== 'boolean') {
      return
    }

    const value = options.disabled
      ? undefined
      : safeGet(this.stores.values.value, options.name) ??
        getFieldValue(options.field?._f ?? safeGet(options.fields, options.name)._f)

    this.stores.values.update(
      (values) => {
        deepSet(values, options.name, value)
        return values
      },
      [options.name],
    )

    this.updateDirtyField(options.name, value)
  }

  /**
   * Update a field's dirty status.
   */
  updateDirtyField(name: string, value?: unknown): boolean {
    const defaultValue = safeGet(this.stores.defaultValues.value, name)

    const currentIsDirty = !deepEqual(defaultValue, value)

    const previousIsDirty = Boolean(safeGet(this.stores.dirtyFields.value, name))

    if (previousIsDirty && !currentIsDirty) {
      this.stores.dirtyFields.update(
        (dirtyFields) => {
          deepUnset(dirtyFields, name)
          return dirtyFields
        },
        [name],
      )
    }

    if (!previousIsDirty && currentIsDirty) {
      this.stores.dirtyFields.update(
        (dirtyFields) => {
          deepSet(dirtyFields, name, true)
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

  //--------------------------------------------------------------------------------------
  // Errors.
  //--------------------------------------------------------------------------------------

  /**
   * Focus on the first field with an error.
   */
  focusError(options?: TriggerOptions) {
    if (options?.shouldFocus || (options == null && this.options.shouldFocusError)) {
      focusFieldBy(
        this.fields,
        (key) => key && safeGet(this.stores.errors.value, key),
        this.names.mount,
      )
    }
  }

  /**
   * Set an error on a field.
   */
  setError<T extends TParsedForm['keys']>(
    name: T | 'root' | `root.${string}`,
    error?: ErrorOption,
    options?: TriggerOptions,
  ): void {
    this.state.open()

    const field: Field | undefined = safeGet(this.fields, name)

    const fieldNames = toStringArray(name)

    this.stores.errors.update((errors) => {
      deepSet(errors, name, { ...error, ref: field?._f?.ref })
      return errors
    }, fieldNames)

    this.stores.isValid.set(false, fieldNames)

    if (options?.shouldFocus) {
      field?._f?.ref?.focus?.()
    }

    this.state.flush()
  }

  /**
   * Merge provided errors the form state's existing errors.
   */
  mergeErrors(errors: FieldErrors<TValues> | FieldErrorRecord, names?: string[]): void {
    const namesToMerge = names ?? Object.keys(errors)

    this.stores.errors.update((currentErrors) => {
      const newErrors = names?.length ? currentErrors : {}

      namesToMerge.forEach((name) => {
        const fieldError = safeGet(errors, name)

        if (fieldError == null) {
          deepUnset(newErrors, name)
          return
        }

        if (!this.names.array.has(name)) {
          deepSet(newErrors, name, fieldError)
          return
        }

        const fieldArrayErrors = safeGet(currentErrors, name) ?? {}

        deepSet(fieldArrayErrors, 'root', errors[name])

        deepSet(newErrors, name, fieldArrayErrors)
      })

      return newErrors
    }, namesToMerge)
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
      nameArray?.forEach((name) => deepUnset(this.stores.errors.value, name))
      return errors
    }, nameArray)
  }

  //--------------------------------------------------------------------------------------
  // Validation.
  //--------------------------------------------------------------------------------------

  /**
   * Lazily validate the form.
   */
  async updateValid(force?: boolean, name?: string | string[]): Promise<void> {
    if (force || this.isTracking('isValid', toStringArray(name))) {
      const result = await this.validate()

      const fieldNames = toStringArray(name)

      this.stores.isValid.set(result.isValid, fieldNames)
    }
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
  // Resetters.
  //--------------------------------------------------------------------------------------

  /**
   * Reset the form control.
   */
  reset(
    formValues?: Defaults<TValues> extends TValues ? TValues : Defaults<TValues>,
    options?: ResetOptions,
  ): void {
    this.state.open()

    const updatedValues = formValues ? structuredClone(formValues) : this.stores.defaultValues.value

    const cloneUpdatedValues = structuredClone(updatedValues)

    const values =
      formValues && isEmptyObject(formValues) ? this.stores.defaultValues.value : cloneUpdatedValues

    if (!options?.keepDefaultValues) {
      this.stores.defaultValues.set(updatedValues as DeepPartial<TValues>)
    }

    if (!options?.keepValues) {
      if (options?.keepDirtyValues || this.options.shouldCaptureDirtyFields) {
        this.setDirtyValues(values)
      } else {
        if (isBrowser() && formValues == null) {
          this.resetFormElement()
        }
        this.fields = {}
      }

      const newValues = this.options.shouldUnregister
        ? options?.keepDefaultValues
          ? structuredClone(this.stores.defaultValues.value)
          : {}
        : structuredClone(values)

      this.stores.values.set(newValues as TValues, true)
    }

    this.names = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
    }

    if (!options?.keepSubmitCount) {
      this.stores.submitCount.set(0)
    }

    if (!options?.keepDirty) {
      this.stores.isDirty.set(
        Boolean(
          options?.keepDefaultValues && !deepEqual(formValues, this.stores.defaultValues.value),
        ),
      )
    }

    if (!options?.keepDirtyValues) {
      if (options?.keepDefaultValues && formValues) {
        this.stores.dirtyFields.set(getDirtyFields(this.stores.defaultValues.value, formValues))
      } else {
        this.stores.dirtyFields.set({})
      }
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
   * Resolve the form control's default values.
   */
  async resolveDefaultValues(defaults?: Defaults<TValues>, resetValues?: boolean): Promise<void> {
    const resolvingDefaultValues = typeof defaults === 'function' ? defaults() : defaults

    if (resolvingDefaultValues == null) {
      this.stores.isLoading.set(false)
      return
    }

    const isPromise = resolvingDefaultValues instanceof Promise

    this.stores.isLoading.set(isPromise)

    const resolvedDefaultValues = (await resolvingDefaultValues) ?? {}

    this.state.open()

    this.stores.defaultValues.set(resolvedDefaultValues as any)

    if (resetValues) {
      this.stores.values.set(structuredClone(resolvedDefaultValues) as TValues)
    }

    this.stores.isLoading.set(false)

    this.state.flush()
  }

  async resetDefaultValues() {
    if (typeof this.options.defaultValues === 'function') {
      const values: any = await this.options.defaultValues()
      this.reset(values, this.options.resetOptions)
    }
  }

  /**
   * Resets the nearest {@link HTMLFormElement}.
   */
  resetFormElement(): void {
    for (const name of this.names.mount) {
      const field: Field | undefined = safeGet(this.fields, name)

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

  //--------------------------------------------------------------------------------------
  // Internal utilities.
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

  /**
   * Whether the form control should skip validation after a specific event.
   */
  shouldSkipValidationAfter(name: string, isBlurEvent?: boolean): boolean {
    return shouldSkipValidationAfter(
      isBlurEvent ? 'blur' : 'change',
      safeGet(this.stores.touchedFields.value, name),
      this.stores.isSubmitted.value,
      this.options.submissionValidationMode,
    )
  }

  setFocus(name: string, options?: { shouldSelect?: boolean }) {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f == null) {
      return
    }

    const fieldRef = field?._f.refs ? field?._f.refs[0] : field?._f.ref

    fieldRef?.focus?.()

    if (options?.shouldSelect && fieldRef && 'select' in fieldRef) {
      fieldRef?.select?.()
    }
  }

  //--------------------------------------------------------------------------------------
  // Lifecycle.
  //--------------------------------------------------------------------------------------

  /**
   */
  mount(): void {
    this.mounted = true
  }

  /**
   */
  unmount(): void {
    this.state.open()

    this.removeUnmounted()

    this.mounted = false

    this.state.flush(true)
  }

  /**
   * Cleanup.
   */
  cleanup(): void {
    this.removeUnmounted()
  }

  /**
   * Remove any fields that should be unmounted.
   *
   * @param force Whether to force notify state subscribers.
   */
  removeUnmounted(force = false): void {
    for (const name of this.names.unMount) {
      const field: Field | undefined = safeGet(this.fields, name)

      if (field?._f.refs ? !field._f.refs.some(elementIsLive) : !elementIsLive(field?._f.ref)) {
        this.unregisterField(name as any, undefined, force)
      }

      this.names.unMount.delete(name)
    }
  }
}
