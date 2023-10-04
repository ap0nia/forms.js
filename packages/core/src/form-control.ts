import { Writable, RecordDerived } from '@forms.js/common/store'

import {
  INPUT_EVENTS,
  VALIDATION_MODE,
  type SubmissionValidationMode,
  type CriteriaMode,
  type ValidationMode,
  type RevalidationMode,
  type Stage,
} from './constants'
import { lookupError } from './logic/errors/lookup-error'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getCurrentFieldValue } from './logic/fields/get-current-field-value'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import { getFieldValue, getFieldValueAs } from './logic/fields/get-field-value'
import { hasValidation } from './logic/fields/has-validation'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { elementIsLive } from './logic/html/element-is-live'
import { isHTMLElement } from './logic/html/is-html-element'
import { mergeElementWithField } from './logic/html/merge-element-with-field'
import { getValidationModes } from './logic/validation/get-validation-modes'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { shouldSkipValidationAfter } from './logic/validation/should-skip-validation-after'
import type { ErrorOption, FieldErrorRecord, FieldErrors } from './types/errors'
import type { Field, FieldRecord, FieldReference } from './types/fields'
import type { InputElement } from './types/html'
import type { Plugin } from './types/plugin'
import type { RegisterOptions } from './types/register'
import type { Resolver } from './types/resolver'
import { deepEqual } from './utils/deep-equal'
import { deepFilter } from './utils/deep-filter'
import { deepSet } from './utils/deep-set'
import { deepUnset } from './utils/deep-unset'
import { isBrowser } from './utils/is-browser'
import { isEmptyObject, isObject } from './utils/is-object'
import { isPrimitive } from './utils/is-primitive'
import type { Noop } from './utils/noop'
import type { Nullish } from './utils/null'
import { safeGet, safeGetMultiple } from './utils/safe-get'
import type { DeepMap } from './utils/types/deep-map'
import type { DeepPartial } from './utils/types/deep-partial'
import type { Defaults } from './utils/types/defaults'
import type { FlattenObject } from './utils/types/flatten-object'
import type { KeysToProperties } from './utils/types/keys-to-properties'
import type { LiteralUnion } from './utils/types/literal-union'

/**
 * Overall form state.
 */
export type FormControlState<T> = {
  /**
   * Whether any of the fields have been modified.
   */
  isDirty: boolean

  /**
   * Whether the form is currently loading its default values.
   * i.e. if it's a promise or a function that returned a promise.
   */
  isLoading: boolean

  /**
   * Whether the form has been submitted.
   */
  isSubmitted: boolean

  /**
   * Whether the form has been submitted successfully.
   */
  isSubmitSuccessful: boolean

  /**
   * Whether the form is currently submitting.
   */
  isSubmitting: boolean

  /**
   * Whether the form is currently validating.
   */
  isValidating: boolean

  /**
   * Whether the form is valid.
   */
  isValid: boolean

  /**
   * The number of times the form has been submitted.
   */
  submitCount: number

  /**
   * Fields that have been modified.
   */
  dirtyFields: Partial<Readonly<DeepMap<T, boolean>>>

  /**
   * Fields that have been touched.
   */
  touchedFields: Partial<Readonly<DeepMap<T, boolean>>>

  /**
   * Default field values.
   */
  defaultValues: DeepPartial<T>

  /**
   * A record of field names mapped to their errors.
   */
  errors: FieldErrors<T>
}

/**
 * The current rendering status of the form control.
 * i.e. For managing lifetimes in UI frameworks.
 */
export type FormControlStatus = { [K in Stage[keyof Stage]]: boolean }

/**
 * Options when disabling a field.
 */
export type UpdateDisabledFieldOptions = {
  /**
   * The name of the field
   */
  name: string

  /**
   * Whether the field is disabled.
   */
  disabled?: boolean

  /**
   * The field itself.
   */
  field?: Field

  /**
   * Fields to retrieve the field from.
   */
  fields?: FieldRecord
}

/**
 * Options for form control behavior.
 *
 * Some options are internal and set automatically based on other options.
 */
export type FormControlOptions<TValues extends Record<string, any>, TContext = any> = {
  /**
   * When to validate the form.
   */
  mode?: ValidationMode[keyof ValidationMode]

  /**
   * When to revalidate the form.
   */
  revalidateMode?: RevalidationMode[keyof RevalidationMode]

  /**
   * Shared data with all resolvers.
   */
  context?: TContext

  /**
   * Default field values.
   */
  defaultValues?: Defaults<TValues>

  /**
   * The actual form values.
   */
  values?: TValues

  /**
   * Which state to preserve when resetting the form.
   */
  resetOptions?: ResetOptions

  /**
   * Override the native validation and process the form directly.
   *
   * TODO: allow array of resolvers and/or plugin API.
   */
  resolver?: Resolver<TValues, TContext> // | Resolver<TValues, TContext>[]

  /**
   * Whether HTML fields should be focused when an error occurs.
   */
  shouldFocusError?: boolean

  /**
   * Whether to unregister fields when they are removed.
   */
  shouldUnregister?: boolean

  /**
   * Whether to use native HTML validation, i.e. use the {@link HTMLInputElement.setCustomValidity} API.
   */
  shouldUseNativeValidation?: boolean

  /**
   * Not sure.
   */
  progressive?: boolean

  /**
   * When to stop validating the form.
   */
  criteriaMode?: CriteriaMode[keyof CriteriaMode]

  /**
   * Debounce setting?
   */
  delayError?: number

  /**
   * TODO: Allow both single plugin and array of plugins.
   */
  plugins?: Plugin<TValues, TContext>[]

  /**
   * Whether to continue validating after the first error is found.
   *
   * @internal Derived from {@link criteriaMode}.
   */
  shouldDisplayAllAssociatedErrors?: boolean

  /**
   * Which events to validate on before/after submission.
   *
   * @internal Derived from {@link mode} and {@link revalidateMode}.
   */
  submissionValidationMode?: SubmissionValidationMode

  /**
   * Whether to capture dirty fields.
   *
   * @internal Derived from {@link resetOptions}.
   */
  shouldCaptureDirtyFields?: boolean
}

/**
 * Generally describes state that can be preserved when doing certain operations.
 *
 * This is a universal subset of all the state that can be preserved,
 * specific methods may allow more options.
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
   * Whether to keep if the most recent submission was successful.
   */
  keepIsSubmitSuccessful?: boolean

  /**
   * Whether to keep the touched status.
   */
  keepTouched?: boolean

  /**
   * Whether to keep the form's current validation status.
   */
  keepIsValid?: boolean
}
/**
 * Helper type to get the flattened form values object.
 */
export type FormControlValues<TValues extends Record<string, any>> = FlattenObject<TValues>

/**
 * Options when triggering a field.
 */
export type TriggerOptions = {
  shouldFocus?: boolean
}

export interface ResetOptions extends KeepStateOptions {
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
   * Whether to keep the form's current submit count.
   */
  keepSubmitCount?: boolean
}

/**
 * Options when unregistering a field.
 */
export interface UnregisterOptions extends KeepStateOptions {
  /**
   * Whether to preserve its value in the form's values.
   */
  keepValue?: boolean

  /**
   * Whether to preserve its default value in the form's default values.
   */
  keepDefaultValue?: boolean

  /**
   * Whether to preserve any errors assigned to the field.
   */
  keepError?: boolean
}

/**
 * Options when setting a value.
 */
export type SetValueOptions = {
  /**
   */
  shouldValidate?: boolean

  /**
   */
  shouldDirty?: boolean

  /**
   */
  shouldTouch?: boolean
}

export type HandlerCallback = (event: Event) => Promise<void>

export type SubmitHandler<T> = (data: T, event: Event) => unknown

export type SubmitErrorHandler<T> = (errors: FieldErrors<T>, event: Event) => unknown

export const defaultFormControlOptions: FormControlOptions<any> = {
  mode: VALIDATION_MODE.onSubmit,
  revalidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
}

/**
 * The core functionality of the library is encompassed by a form control that controls field/form behavior.
 */
export class FormControl<TValues extends Record<string, any>, TContext = any> {
  /**
   * The resolved options for the form.
   *
   * @public
   */
  options: FormControlOptions<TValues, TContext>

  /**
   * The current state of the form. All top-level properties are observables.
   *
   * @public
   */
  state: { [Key in keyof FormControlState<TValues>]: Writable<FormControlState<TValues>[Key]> }

  derivedState: RecordDerived<{
    [Key in keyof FormControlState<TValues>]: Writable<FormControlState<TValues>[Key]>
  }>

  /**
   */
  values: Writable<TValues>

  status: Writable<FormControlStatus>

  /**
   * Registered fields.
   *
   * @internal
   */
  fields: FieldRecord = {}

  /**
   * Names of fields doing something.
   *
   * @internal
   */
  names = {
    mount: new Set<string>(),
    unMount: new Set<string>(),
    array: new Set<string>(),
    watch: new Set<string>(),
    watchAll: false,
  }

  unmountActions: Noop[] = []

  constructor(options?: FormControlOptions<TValues, TContext>) {
    const resolvedOptions = { ...defaultFormControlOptions, ...options }

    resolvedOptions.shouldDisplayAllAssociatedErrors ??=
      resolvedOptions.criteriaMode === VALIDATION_MODE.all

    resolvedOptions.submissionValidationMode ??= {
      beforeSubmission: getValidationModes(resolvedOptions.mode),
      afterSubmission: getValidationModes(resolvedOptions.revalidateMode),
    }

    resolvedOptions.shouldCaptureDirtyFields ??= Boolean(
      resolvedOptions.resetOptions?.keepDirtyValues,
    )

    // Default values are defined if they're a concrete (non-promise) object.
    const isDefaultValuesDefined =
      !(resolvedOptions.defaultValues instanceof Promise) && isObject(resolvedOptions.defaultValues)

    // Default values fallsback to values and then an empty object.
    const defaultValues =
      (isDefaultValuesDefined && structuredClone(options?.defaultValues)) ||
      structuredClone(resolvedOptions.values ?? {})

    /**
     * Possibly a promise that's resolving the default values.
     */
    const resolvingDefaultValues =
      typeof resolvedOptions.defaultValues === 'function'
        ? resolvedOptions.defaultValues()
        : resolvedOptions.defaultValues

    this.options = resolvedOptions

    this.state = {
      submitCount: new Writable(0),
      isDirty: new Writable(false),
      isLoading: new Writable(resolvingDefaultValues instanceof Promise),
      isValidating: new Writable(false),
      isSubmitted: new Writable(false),
      isSubmitting: new Writable(false),
      isSubmitSuccessful: new Writable(false),
      isValid: new Writable(false),
      touchedFields: new Writable({}),
      dirtyFields: new Writable({}),
      defaultValues: new Writable(defaultValues),
      errors: new Writable({}),
    }

    this.values = new Writable(
      resolvedOptions.shouldUnregister ? {} : structuredClone(defaultValues),
    )

    this.status = new Writable<FormControlStatus>({
      init: true,
      mount: false,
    })

    this.derivedState = new RecordDerived(this.state, new Set())

    resolvedOptions.plugins?.forEach((plugin) => {
      plugin.onInit?.(this)
    })

    /**
     * Ensure that default values are handled.
     */
    this.resetDefaultValues(resolvingDefaultValues, true)
  }

  getValues(): TValues

  getValues<T extends keyof FlattenObject<TValues>>(field: T): FlattenObject<TValues>[T]

  getValues<T extends (keyof FlattenObject<TValues>)[]>(
    fields: T,
  ): KeysToProperties<FlattenObject<TValues>, T>

  getValues<T extends (keyof FlattenObject<TValues>)[]>(
    ...fields: T
  ): KeysToProperties<FlattenObject<TValues>, T>

  getValues(...args: any[]): any {
    const names = args.length > 1 ? args : args[0]
    return safeGetMultiple(this.values.value, names)
  }

  /**
   * Determines whether the store is currently dirty. Does not update the state.
   */
  getDirty(): boolean {
    return !deepEqual(this.state.defaultValues.value, this.values.value)
  }

  /**
   * Focus on a field that has an error.
   */
  focusError(options?: TriggerOptions) {
    if (this.options.shouldFocusError || options?.shouldFocus) {
      focusFieldBy(
        this.fields,
        (key) => key && safeGet(this.state.errors.value, key),
        this.names.mount,
      )
    }
  }

  /**
   * Updates whether the form is valid.
   *
   * Saves on computation by only updating if the store has subscribers.
   *
   * @updates isValid.
   *
   * @param force Whether to force the validation and the store to update and notify subscribers.
   */
  async updateValid(force?: boolean): Promise<void> {
    if (!force && !this.derivedState.keys?.has('isValid')) {
      return
    }

    const result = await this.validate()

    // Update isValid.
    this.state.isValid.set(result.isValid)
  }

  /**
   * Trigger a field.
   *
   * @updates isValidating, errors, isValid.
   */
  async trigger<T extends keyof FlattenObject<TValues>>(
    name?: T | T[] | readonly T[],
    options?: TriggerOptions,
  ): Promise<boolean> {
    this.derivedState.freeze()

    // Update isValidating and force derivedState to update.
    this.derivedState.transaction(() => {
      this.state.isValidating.set(true)
    })

    const result = await this.validate(name as any)

    if (result.validationResult) {
      // Update errors.
      this.mergeErrors(result.validationResult.errors, result.validationResult.names)
    }

    if (result.resolverResult?.errors) {
      // Update errors.
      this.mergeErrors(result.resolverResult.errors)
    }

    // Update isValid.
    this.state.isValid.set(result.isValid)

    // Update isValidating and force derivedState to update.
    this.derivedState.transaction(() => {
      this.state.isValidating.set(false)
    })

    if (options?.shouldFocus && !result.isValid) {
      const fieldNames = (name == null || Array.isArray(name) ? name : [name]) as
        | string[]
        | undefined
      const callback = (key?: string) => key && safeGet(this.state.errors.value, key)
      focusFieldBy(this.fields, callback, name ? fieldNames : this.names.mount)
    }

    this.derivedState.unfreeze()

    return result.isValid
  }

  /**
   * Set an error.
   *
   * @updates errors, isValid.
   */
  setError<T extends keyof FlattenObject<TValues>>(
    name: T | 'root' | `root.${string}`,
    error?: ErrorOption,
    options?: TriggerOptions,
  ): void {
    this.derivedState.freeze()

    const field: Field | undefined = safeGet(this.fields, name)

    // Update errors.
    this.state.errors.update((errors) => {
      deepSet(errors, name, { ...error, ref: field?._f?.ref })
      return errors
    })

    // Update isValid.
    this.state.isValid.set(false)

    if (options?.shouldFocus) {
      field?._f?.ref?.focus?.()
    }

    this.derivedState.unfreeze()
  }

  /**
   * @remarks MUST NOT NOTIFY ANY SIGNAL LISTENERS BECAUSE REACT SUCKS.
   */
  register<T extends keyof FlattenObject<TValues>>(
    name: Extract<T, string>,
    options?: RegisterOptions<TValues, T>,
  ) {
    this.registerField(name, options)

    const props = {
      registerElement: (element: InputElement) => this.registerElement(name, element, options),
      unregisterElement: () => this.unregisterElement(name, options),
    }

    return props
  }

  /**
   * Register an HTML input element.
   *
   * @remarks MUST NOT NOTIFY ANY SIGNAL LISTENERS BECAUSE REACT SUCKS.
   */
  registerElement<T extends keyof FlattenObject<TValues>>(
    name: Extract<T, string>,
    element: InputElement,
    options?: RegisterOptions<TValues, T>,
  ): void {
    const field = this.registerField(name, options)

    const newField = mergeElementWithField(name, field, element)

    const defaultValue =
      safeGet(this.values.value, name) ?? safeGet(this.state.defaultValues.value, name)

    if (defaultValue == null || (newField._f.ref as HTMLInputElement)?.defaultChecked) {
      deepSet(this.values.value, name, getFieldValue(newField._f))
    } else {
      updateFieldReference(newField._f, defaultValue)
    }

    deepSet(this.fields, name, newField)

    this.updateValid()
  }

  /**
   * @remarks MUST NOT NOTIFY ANY SIGNAL SUBSCRIBERS BECAUSE REACT SUCKS.
   */
  registerField<T extends keyof FlattenObject<TValues>>(
    name: Extract<T, string>,
    options?: RegisterOptions<TValues, T>,
  ) {
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
      this.mockUpdateDisabledField({ field, disabled: options?.disabled, name })
      return field
    }

    const defaultValue =
      safeGet(this.values.value, name) ??
      options?.value ??
      safeGet(this.state.defaultValues.value, name)

    deepSet(this.values.value, name, defaultValue)

    return field
  }

  /**
   * Unregister a field.
   */
  unregister<T extends keyof FlattenObject<TValues>>(
    name?: Extract<T, string> | Extract<T, string>[],
    options?: UnregisterOptions,
  ): void {
    this.derivedState.freeze()

    const nameArray = Array.isArray(name) ? name : name ? [name] : Array.from(this.names.mount)

    for (const fieldName of nameArray) {
      this.names.mount.delete(fieldName)
      this.names.array.delete(fieldName)

      if (!options?.keepValue) {
        deepUnset(this.fields, fieldName)

        this.values.update((values) => {
          deepUnset(values, fieldName)
          return values
        })
      }

      if (!options?.keepError) {
        this.state.errors.update((errors) => {
          deepUnset(errors, fieldName)
          return errors
        })
      }

      if (!options?.keepDirty) {
        this.state.dirtyFields.update((dirtyFields) => {
          deepUnset(dirtyFields, fieldName)
          return dirtyFields
        })

        this.state.isDirty.set(this.getDirty())
      }

      if (!options?.keepTouched) {
        this.state.touchedFields.update((touchedFields) => {
          deepUnset(touchedFields, fieldName)
          return touchedFields
        })
      }

      if (!this.options.shouldUnregister && !options?.keepDefaultValue) {
        this.state.defaultValues.update((defaultValues) => {
          deepUnset(defaultValues, fieldName)
          return defaultValues
        })
      }
    }

    if (!options?.keepIsValid) {
      this.updateValid()
    }

    this.derivedState.unfreeze()
  }

  /**
   * Prepares an element to be unregistered.
   * {@link cleanup} or {@link unmount} must be called to fully complete the unregistration.
   */
  unregisterElement<T extends keyof FlattenObject<TValues>>(
    name: LiteralUnion<Extract<T, string>, string>,
    options?: RegisterOptions<TValues, T>,
  ): void {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f) {
      field._f.mount = false
    }

    const shouldUnregister = this.options.shouldUnregister || options?.shouldUnregister

    if (shouldUnregister && !this.names.array.has(name)) {
      this.names.unMount.add(name)
    }
  }

  /**
   * Sets one field value.
   *
   * @updates dirtyFields, isDirty, touchedFields. Maybe errors, isValidating, isValid.
   */
  setValue<T extends keyof FlattenObject<TValues>>(
    name: Extract<T, string>,
    value: FlattenObject<TValues>[T],
    options?: SetValueOptions,
  ): void {
    this.derivedState.freeze()

    const field: Field | undefined = safeGet(this.fields, name)

    const clonedValue = structuredClone(value)

    // Update values.
    this.values.update((values) => {
      deepSet(values, name, clonedValue)
      return values
    })

    const isFieldArray = this.names.array.has(name)

    if (!isFieldArray) {
      if (field && !field._f && clonedValue != null) {
        this.setValues(name, clonedValue, options)
      } else {
        this.setFieldValue(name, clonedValue, options)
      }
    } else {
      if (options?.shouldDirty) {
        this.state.dirtyFields.set(
          getDirtyFields(this.state.defaultValues.value, this.values.value),
        )
        this.state.isDirty.set(this.getDirty())
      }
    }

    const shouldNotify = this.isWatched(name)

    this.derivedState.unfreeze(shouldNotify)
  }

  /**
   * Whether a field name is being watched.
   */
  isWatched(name: string): boolean {
    return (
      this.names.watchAll ||
      this.names.watch.has(name) ||
      Array.from(this.names.watch).some(
        (watchName) => name.startsWith(watchName) && /^\.\w+/.test(name.slice(watchName.length)),
      )
    )
  }

  /**
   * Appends the values from the value object to the given field name.
   *
   * @example
   *
   * ```ts
   * const name = 'a'
   * const value = { b: 'c' }
   * const result = { a: { b: 'c' } }
   * ```
   *
   * @updates Updates dirtyFields, isDirty, touchedFields. Maybe errors, isValidating, isValid.
   */
  setValues(name: string, value: any, options?: SetValueOptions): void {
    this.derivedState.freeze()

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
        // Updates dirtyFields, isDirty, touchedFields. Maybe errors, isValidating, isValid.
        this.setFieldValue(fieldName, fieldValue, options)
      }
    }

    this.derivedState.unfreeze()
  }

  /**
   * Sets a field's value.
   *
   * @updates dirtyFields, isDirty, touchedFields. Maybe errors, isValidating, isValid.
   */
  setFieldValue(name: string, value: unknown, options?: SetValueOptions): void {
    this.derivedState.freeze()

    const field: Field | undefined = safeGet(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      // Update dirtyFields, isDirty, touchedFields.
      this.touch(name, value, options)
      return
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    updateFieldReference(fieldReference, fieldValue)

    // If the field exists and isn't disabled, then also update the form values.
    if (!fieldReference.disabled) {
      this.values.update((values) => {
        deepSet(values, name, getFieldValueAs(value, fieldReference))
        return values
      })
    }

    // Update dirtyFields, isDirty, touchedFields.
    this.touch(name, fieldValue, options)

    if (options?.shouldValidate) {
      this.trigger(name as any)
    }

    this.derivedState.unfreeze()
  }

  /**
   * Handles a change event from an input element.
   */
  async handleChange(event: Event): Promise<void | boolean> {
    this.derivedState.freeze()

    const target: any = event.target

    const name = target.name

    const field: Field | undefined = safeGet(this.fields, name)

    if (field == null) {
      return
    }

    const fieldValue = getCurrentFieldValue(event, field)

    // Update values.
    this.values.update((values) => {
      deepSet(values, name, fieldValue)
      return values
    })

    const isBlurEvent = event.type === INPUT_EVENTS.BLUR || event.type === INPUT_EVENTS.FOCUS_OUT

    if (isBlurEvent) {
      field._f.onBlur?.(event)
    } else {
      field._f.onChange?.(event)
    }

    if (isBlurEvent) {
      // Updates touchedFields.
      this.updateTouchedField(name)
    } else {
      // Updates dirtyFields, isDirty.
      this.updateDirtyField(name, fieldValue)
    }

    const nothingToValidate =
      !hasValidation(field._f) &&
      !this.options.resolver &&
      !safeGet(this.state.errors.value, name) &&
      !field._f.deps

    const shouldSkipValidation =
      nothingToValidate ||
      shouldSkipValidationAfter(
        isBlurEvent ? 'blur' : 'change',
        safeGet(this.state.touchedFields.value, name),
        this.state.isSubmitted.value,
        this.options.submissionValidationMode,
      )

    if (shouldSkipValidation) {
      // Update isValid.
      await this.updateValid()

      this.derivedState.unfreeze(!isBlurEvent && this.isWatched(name))

      return
    }

    // Update isValidating and force derivedState to update.
    this.derivedState.transaction(() => {
      this.state.isValidating.set(true)
    })

    const result = await this.validate(name)

    if (result.resolverResult) {
      const previousError = lookupError(this.state.errors.value, this.fields, name)

      const currentError = lookupError(
        result.resolverResult.errors ?? {},
        this.fields,
        previousError.name,
      )

      // Update errors.
      this.state.errors.update((errors) => {
        if (currentError.error) {
          deepSet(errors, currentError.name, currentError.error)
        } else {
          deepUnset(errors, currentError.name)
        }
        return errors
      })

      if (field._f.deps) {
        // Update isValidating, errors, isValid.
        this.trigger(field._f.deps as any)
      } else {
        // Update isValidating.
        this.state.isValid.set(result.isValid)
      }
    }

    if (result.validationResult) {
      const isFieldValueUpdated =
        Number.isNaN(fieldValue) || (fieldValue === safeGet(this.values.value, name) ?? fieldValue)

      const error = result.validationResult.errors[name]

      if (isFieldValueUpdated && !error && this.state.isValid.hasSubscribers) {
        const fullResult = await this.validate()

        if (fullResult.validationResult?.errors) {
          // Update errors.
          this.mergeErrors(fullResult.validationResult.errors, fullResult.validationResult.names)
        }
      } else {
        // Update errors.
        this.state.errors.update((errors) => {
          deepSet(errors, name, error)
          return errors
        })
      }

      if (isFieldValueUpdated && field._f.deps) {
        this.trigger(field._f.deps as any)
      } else {
        // Update isValidating.
        this.state.isValid.set(result.isValid)
      }
    }

    this.state.isValidating.set(false)
    this.derivedState.unfreeze()
  }

  /**
   */
  handleSubmit(
    onValid?: SubmitHandler<TValues>,
    onInvalid?: SubmitErrorHandler<TValues>,
  ): HandlerCallback {
    return async (event) => {
      this.derivedState.freeze()

      event.preventDefault?.()

      // Update isSubmitting.
      this.state.isSubmitting.set(true)

      const { isValid, resolverResult, validationResult } = await this.validate()

      const errors = resolverResult?.errors ?? validationResult?.errors ?? {}

      deepUnset(this.state.errors.value, 'root')

      // Update errors.
      this.mergeErrors(errors)

      if (isValid) {
        const data = structuredClone(resolverResult?.values ?? this.values.value) as any
        await onValid?.(data, event)
      } else {
        await onInvalid?.(errors, event)
        this.focusError()
        setTimeout(this.focusError.bind(this))
      }

      this.state.isSubmitted.set(true)
      this.state.isSubmitting.set(false)
      this.state.isSubmitSuccessful.set(isEmptyObject(this.state.errors.value))
      this.state.submitCount.update((count) => count + 1)

      this.derivedState.unfreeze()
    }
  }

  /**
   */
  reset(formValues?: Defaults<TValues>, options?: ResetOptions): void {
    this.derivedState.freeze()

    const updatedValues = formValues ? structuredClone(formValues) : this.state.defaultValues.value

    const cloneUpdatedValues = structuredClone(updatedValues)

    const values =
      formValues && isEmptyObject(formValues) ? this.state.defaultValues.value : cloneUpdatedValues

    if (!options?.keepDefaultValues) {
      this.state.defaultValues.set(updatedValues as DeepPartial<TValues>)
    }

    if (!options?.keepValues) {
      if (options?.keepDirtyValues || this.options.shouldCaptureDirtyFields) {
        for (const fieldName of this.names.mount) {
          if (safeGet(this.state.dirtyFields.value, fieldName)) {
            deepSet(values, fieldName, safeGet(this.values.value, fieldName))
          } else {
            // FIXME: don't set state if not needed.
            this.setValue(fieldName as any, safeGet(values, fieldName))
          }
        }
      } else {
        if (isBrowser() && formValues == null) {
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

        this.fields = {}
      }

      const newValues = this.options.shouldUnregister
        ? options?.keepDefaultValues
          ? structuredClone(this.state.defaultValues.value)
          : {}
        : structuredClone(values)

      this.values.set(newValues as TValues)
    }

    this.names = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
      watch: new Set(),
      watchAll: false,
    }

    if (!options?.keepSubmitCount) {
      this.state.submitCount.set(0)
    }

    if (!options?.keepDirty) {
      this.state.isDirty.set(
        Boolean(
          options?.keepDefaultValues && !deepEqual(formValues, this.state.defaultValues.value),
        ),
      )
    }

    if (!options?.keepDirtyValues) {
      if (options?.keepDefaultValues && formValues) {
        this.state.dirtyFields.set(getDirtyFields(this.state.defaultValues.value, formValues))
      } else {
        this.state.dirtyFields.set({})
      }
    }

    if (!options?.keepTouched) {
      this.state.touchedFields.set({})
    }

    if (!options?.keepErrors) {
      this.state.errors.set({})
    }

    if (!options?.keepIsSubmitSuccessful) {
      this.state.isSubmitSuccessful.set(false)
    }

    this.state.isSubmitting.set(false)

    this.derivedState.unfreeze()
  }

  /**
   * @param resetValues Whether to reset the form's values too.
   */
  async resetDefaultValues(
    resolvingDefaultValues: Defaults<TValues>,
    resetValues?: boolean,
  ): Promise<void> {
    if (resolvingDefaultValues == null) {
      // Ensure that the form is not loading.
      this.state.isLoading.set(false)
      return
    }

    // If the form wasn't loading, it should be now since it's waiting for the default values to resolve.
    if (!this.state.isLoading.value && resolvingDefaultValues instanceof Promise) {
      this.state.isLoading.set(true)
    }

    const resolvedDefaultValues = await resolvingDefaultValues

    this.state.defaultValues.set((resolvedDefaultValues ?? {}) as any)

    if (resetValues) {
      const newValues = structuredClone(resolvedDefaultValues)
      this.values.set(newValues as TValues)
    }

    // If the form was loading, it should be done now.
    if (this.state.isLoading.value) {
      this.state.isLoading.set(false)
    }
  }

  /**
   * Merges errors into the form state's errors.
   *
   * Errors from a resolver or native validator can be generated without updating the form state.
   * This method merges those errors into form state's errors store and notifies subscribers.
   *
   * The names array is helpful for capturing names of fields with removed errors.
   *
   * @param errors The errors into the form state's errors.
   * @param names The names of the affected fields.
   */
  mergeErrors(errors: FieldErrors<TValues> | FieldErrorRecord, names?: string[]): void {
    const namesToMerge = names ?? Object.keys(errors)

    this.state.errors.update((currentErrors) => {
      const newErrors = names?.length ? currentErrors : {}

      namesToMerge.forEach((name) => {
        const fieldError = safeGet(errors, name)

        // Removed error.
        if (fieldError == null) {
          deepUnset(newErrors, name)
          return
        }

        // Added regular error.
        if (!this.names.array.has(name)) {
          deepSet(newErrors, name, fieldError)
          return
        }

        // Added field array error.
        const fieldArrayErrors = safeGet(currentErrors, name) ?? {}

        deepSet(fieldArrayErrors, 'root', errors[name])

        deepSet(newErrors, name, fieldArrayErrors)
      })

      return newErrors
    })
  }

  /**
   * Touches a field.
   *
   * @updates dirtyFields, isDirty, touchedFields.
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
   * Updates the specified field name to be touched.
   *
   * @updates touchedFields.
   *
   * @returns Whether the field's touched status changed.
   */
  updateTouchedField(name: string): boolean {
    const previousIsTouched = safeGet(this.state.touchedFields.value, name)

    if (!previousIsTouched) {
      this.state.touchedFields.update((touchedFields) => {
        deepSet(touchedFields, name, true)
        return touchedFields
      })
    }

    return !previousIsTouched
  }

  mockUpdateDisabledField(options: UpdateDisabledFieldOptions): boolean {
    if (typeof options.disabled !== 'boolean') {
      return false
    }

    const value = options.disabled
      ? undefined
      : safeGet(this.values.value, options.name) ??
        getFieldValue(options.field?._f ?? safeGet(options.fields, options.name)._f)

    deepSet(this.values.value, options.name, value)

    this.mockUpdateDirtyField(options.name, value)

    return true
  }

  mockUpdateDirtyField(name: string, value?: unknown) {
    const defaultValue = safeGet(this.state.defaultValues.value, name)

    // The field will be dirty if its value is different from its default value.
    const currentIsDirty = !deepEqual(defaultValue, value)

    const previousIsDirty = Boolean(safeGet(this.state.dirtyFields.value, name))

    // The field is turning dirty to clean.
    if (previousIsDirty && !currentIsDirty) {
      deepUnset(this.state.dirtyFields.value, name)
    }

    // The field is turning clean to dirty.
    if (!previousIsDirty && currentIsDirty) {
      deepSet(this.state.dirtyFields.value, name, true)
    }

    /**
     * Whether the form is dirty.
     */
    const isDirty = this.getDirty()

    return { previousIsDirty, currentIsDirty, isDirty }
  }

  /**
   * Updates a field's disabled status and the corresponding value in the form values.
   *
   * @updates values, dirtyFields, isDirty.
   */
  updateDisabledField(options: UpdateDisabledFieldOptions): void {
    const changed = this.mockUpdateDisabledField(options)

    if (changed) {
      this.derivedState.freeze()

      this.values.update((values) => ({ ...values }))
      this.state.dirtyFields.update((dirtyFields) => ({ ...dirtyFields }))

      this.derivedState.unfreeze()
    }
  }

  /**
   * Updates a field's dirty status.
   *
   * @updates dirtyFields, isDirty.
   *
   * @returns Whether the field's dirty status changed.
   */
  updateDirtyField(name: string, value?: unknown): boolean {
    const { previousIsDirty, currentIsDirty } = this.mockUpdateDirtyField(name, value)

    this.state.isDirty.set(currentIsDirty)

    if (currentIsDirty) {
      this.state.dirtyFields.update((dirtyFields) => ({ ...dirtyFields }))
    }

    return currentIsDirty !== previousIsDirty
  }

  /**
   * Validate the form using either a provided resolver or native validation.
   *
   * @param name The name or names of the fields to validate. If not provided, all fields will be validated.
   *
   * TODO: return type.
   *
   * @returns Whether the form is valid and the resolver or native validation result.
   */
  async validate(name?: string | string[] | Nullish) {
    const nameArray = (name == null || Array.isArray(name) ? name : [name]) as string[] | undefined

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate(nameArray)

      const isValid = validationResult.valid

      return { validationResult, isValid }
    } else {
      const names = nameArray ?? Array.from(this.names.mount)

      const fields: Record<string, FieldReference> = {}

      for (const name of names) {
        const field: Field | undefined = safeGet(this.fields, name)

        if (field) {
          deepSet(fields, name, field._f)
        }
      }

      const resolverResult = await this.options.resolver(this.values.value, this.options.context, {
        names: names as any,
        fields,
        criteriaMode: this.options.criteriaMode,
        shouldUseNativeValidation: this.options.shouldUseNativeValidation,
      })

      const isValid = resolverResult.errors == null || isEmptyObject(resolverResult.errors)

      return { resolverResult, isValid }
    }
  }

  /**
   * Natively validate all of the form's registered fields.
   *
   * @param names The name or names of the fields to validate. If not provided, all fields will be validated.
   * @param shouldOnlyCheckValid Whether to stop validating after the first error is found.
   */
  async nativeValidate(
    names?: string | string[],
    shouldOnlyCheckValid?: boolean,
  ): Promise<NativeValidationResult> {
    const fields = deepFilter(this.fields, names)

    const validationResult = await nativeValidateFields(fields, this.values.value, {
      shouldOnlyCheckValid,
      shouldUseNativeValidation: this.options.shouldUseNativeValidation,
      shouldDisplayAllAssociatedErrors: this.options.shouldDisplayAllAssociatedErrors,
      isFieldArrayRoot: (name) => this.names.array.has(name),
    })

    return validationResult
  }

  mount() {
    this.status.set({ init: false, mount: true })
  }

  unmount() {
    this.cleanup()
  }

  cleanup() {
    this.removeUnmounted()
  }

  removeUnmounted(): void {
    for (const name of this.names.unMount) {
      const field: Field | undefined = safeGet(this.fields, name)

      if (field?._f.refs ? !field._f.refs.some(elementIsLive) : !elementIsLive(field?._f.ref)) {
        this.unregister(name as any)
      }
    }

    this.names.unMount = new Set()
  }

  watch(): FlattenObject<TValues>

  watch(callback: (data: any, context: { name?: string; type?: string }) => void): () => void

  watch<T extends keyof FlattenObject<TValues>>(
    name: T,
    defaultValues?: DeepPartial<TValues>,
  ): FlattenObject<TValues>[T]

  watch<T extends (keyof FlattenObject<TValues>)[]>(
    name: T,
    defaultValues?: DeepPartial<FlattenObject<TValues>>,
  ): KeysToProperties<FlattenObject<TValues>, T>

  watch(...args: any[]): any {
    if (typeof args[0] === 'function') {
      return this.values.subscribe((values) => {
        // TODO: fill this out.
        const context = {}
        return args[0](values, context)
      })
    }

    const nameArray: string[] = Array.isArray(args[0]) ? args[0] : [args[0]]

    nameArray.forEach((name) => {
      this.names.watch.add(name)
    })

    return safeGetMultiple(this.values.value, nameArray)
  }

  clearErrors(name?: string | string[]) {
    if (name == null) {
      this.state.errors.set({})
      return
    }

    const nameArray = Array.isArray(name) ? name : [name]

    this.state.errors.update((errors) => {
      nameArray.forEach((name) => deepUnset(this.state.errors.value, name))
      return errors
    })
  }

  setFocus(name: string, options: { shouldSelect?: boolean } = {}) {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f == null) {
      return
    }

    const fieldRef = field?._f.refs ? field?._f.refs[0] : field?._f.ref

    fieldRef?.focus?.()

    if (options.shouldSelect && fieldRef && 'select' in fieldRef) {
      fieldRef?.select?.()
    }
  }

  getFieldState(name: string, formState?: FormControlState<TValues>) {
    const errors = formState?.errors ?? this.state.errors.value
    const dirtyFields = formState?.dirtyFields ?? this.state.dirtyFields.value
    const touchedFields = formState?.touchedFields ?? this.state.touchedFields.value

    return {
      invalid: Boolean(safeGet(errors, name)),
      isDirty: Boolean(safeGet(dirtyFields, name)),
      isTouched: Boolean(safeGet(touchedFields, name)),
      error: safeGet(errors, name),
    }
  }
}
