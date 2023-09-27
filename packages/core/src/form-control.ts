import {
  INPUT_EVENTS,
  VALIDATION_MODE,
  type CriteriaMode,
  type RevalidationMode,
  type SubmissionValidationMode,
  type ValidationMode,
} from './constants'
import { lookupError } from './logic/errors/lookup-error'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getCurrentFieldValue } from './logic/fields/get-current-field-value'
import { getFieldValue, getFieldValueAs } from './logic/fields/get-field-value'
import { hasValidation } from './logic/fields/has-validation'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { elementIsLive } from './logic/html/element-is-live'
import { isHTMLElement } from './logic/html/is-html-element'
import { mergeElementWithField } from './logic/html/merge-element-with-field'
import { getResolverOptions } from './logic/resolver/get-resolver-options'
import { getValidationModes } from './logic/validation/get-validation-modes'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { shouldSkipValidationAfter } from './logic/validation/should-skip-validation-after'
import { Writable } from './store'
import type { FieldErrors, InternalFieldErrors } from './types/errors'
import type { AnyEvent } from './types/event'
import type { Field, FieldRecord } from './types/fields'
import type { RegisterOptions, RegisterResult } from './types/register'
import type { Resolver, ResolverResult } from './types/resolver'
import type { SubmitErrorHandler, SubmitHandler } from './types/submit'
import { deepEqual } from './utils/deep-equal'
import { deepFilter } from './utils/deep-filter'
import { deepSet } from './utils/deep-set'
import { deepUnset } from './utils/deep-unset'
import { isEmptyObject, isObject } from './utils/is-object'
import type { Noop } from './utils/noop'
import type { Nullish } from './utils/null'
import { safeGet, safeGetMultiple } from './utils/safe-get'
import type { DeepMap } from './utils/types/deep-map'
import type { DeepPartial } from './utils/types/deep-partial'
import type { FlattenObject } from './utils/types/flatten-object'
import type { KeysToProperties } from './utils/types/keys-to-properties'

const defaultOptions: FormControlOptions<any> = {
  mode: VALIDATION_MODE.onSubmit,
  revalidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
}

type FormControlOptions<TValues extends Record<string, any>, TContext = any> = {
  /**
   * When to validate the form.
   */
  mode?: ValidationMode[keyof ValidationMode]

  /**
   * When to revalidate the form.
   */
  revalidateMode?: RevalidationMode[keyof RevalidationMode]

  /**
   * Default values for form fields.
   */
  defaultValues?:
    | DeepPartial<TValues>
    | (() => DeepPartial<TValues> | Promise<DeepPartial<TValues>>)

  /**
   * Set the form values directly.
   */
  values?: TValues

  /**
   * How to treat the form state when resetting it.
   */
  resetOptions?: KeepStateOptions

  /**
   * Processes the form values.
   */
  resolver?: Resolver<TValues, TContext>

  /**
   * TODO: Placeholder.
   */
  context?: TContext

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
   * Mostly an internal option. Whether to continue validating after the first error is found.
   */
  shouldDisplayAllAssociatedErrors?: boolean
}

/**
 * What to do when transitioning between states?
 */
type KeepStateOptions = {
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

/**
 * Overall form state.
 */
type FormState<T> = {
  /**
   * Whether any of the fields have been modified.
   */
  isDirty: boolean

  /**
   * Whether the form is currently loading its default values?
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
   * The default values?
   */
  defaultValues: DeepPartial<T>

  /**
   * The current form values.
   */
  values: T

  /**
   * A record of field names mapped to their errors.
   */
  errors: FieldErrors<T>

  /**
   * The state of the form component.
   */
  component: ComponentState
}

/**
 * The state of the form component.
 */
export type ComponentState = {
  /**
   * Whether the form has been mounted.
   */
  mounted: boolean
}

/**
 * A form's values are structured as an object.
 *
 * In order to deeply reference a value, a dot-concatenated string path is used.
 *
 * This is also translated to type definitions.
 */
export type ParsedForm<T = Record<string, any>> = {
  /**
   * The flattened form values.
   */
  flattened: FlattenObject<T>

  /**
   * Keys to access the flattened form values.
   */
  keys: Extract<keyof FlattenObject<T>, string>
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

/**
 * Options when disabling a field.
 */
export type UpdateDisabledFieldOptions = {
  /**
   */
  disabled?: boolean

  /**
   */
  name: string

  /**
   */
  field?: Field

  /**
   */
  fields?: FieldRecord
}

export type TriggerOptions = {
  shouldFocus?: boolean
}

export type UnregisterOptions = Omit<
  KeepStateOptions,
  'keepIsSubmitted' | 'keepSubmitCount' | 'keepValues' | 'keepDefaultValues' | 'keepErrors'
> & { keepValue?: boolean; keepDefaultValue?: boolean; keepError?: boolean }

/**
 * The core functionality of the library is encompassed by a form control that controls field/form behavior.
 */
export class FormControl<
  TValues extends Record<string, any>,
  TContext = any,
  TParsedForm extends ParsedForm<TValues> = ParsedForm<TValues>,
> {
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
  state: { [Key in keyof FormState<TValues>]: Writable<FormState<TValues>[Key]> }

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
  }

  submissionValidationMode: SubmissionValidationMode

  /**
   * Actions to run when the form is unmounted.
   */
  unmountActions: Noop[] = []

  constructor(options?: FormControlOptions<TValues, TContext>) {
    const resolvedOptions = { ...defaultOptions, ...options }

    resolvedOptions.shouldDisplayAllAssociatedErrors ??=
      resolvedOptions.criteriaMode === VALIDATION_MODE.all

    const defaultValues =
      isObject(resolvedOptions.defaultValues) || isObject(resolvedOptions.values)
        ? structuredClone(resolvedOptions.defaultValues || resolvedOptions.values)
        : {}

    this.options = resolvedOptions

    this.state = {
      submitCount: new Writable(0),
      isDirty: new Writable(false),
      isLoading: new Writable(typeof resolvedOptions.defaultValues === 'function'),
      isValidating: new Writable(false),
      isSubmitted: new Writable(false),
      isSubmitting: new Writable(false),
      isSubmitSuccessful: new Writable(false),
      isValid: new Writable(false),
      touchedFields: new Writable({}),
      dirtyFields: new Writable({}),
      defaultValues: new Writable(defaultValues),
      values: new Writable(resolvedOptions.shouldUnregister ? {} : structuredClone(defaultValues)),
      errors: new Writable({}),
      component: new Writable({ mounted: false } as ComponentState),
    }

    this.submissionValidationMode = {
      beforeSubmission: getValidationModes(resolvedOptions.mode),
      afterSubmission: getValidationModes(resolvedOptions.revalidateMode),
    }
  }

  /**
   * Gets all the values.
   */
  getValues(): TValues

  /**
   * Gets a single value.
   */
  getValues<T extends TParsedForm['keys']>(fieldName: T): TParsedForm['flattened'][T]

  /**
   * Get an array of values.
   */
  getValues<T extends TParsedForm['keys'][]>(
    names: readonly [...T],
  ): KeysToProperties<TParsedForm['flattened'], T>

  /**
   * Get an array of values.
   */
  getValues<T extends TParsedForm['keys'][]>(
    ...names: readonly [...T]
  ): KeysToProperties<TParsedForm['flattened'], T>

  /**
   * Implementation.
   *
   * The loose typing has lower priority than the overloads, so it's not observed publicly.
   *
   * @internal
   */
  getValues(...fieldNames: any[]): any {
    const names = fieldNames.length > 1 ? fieldNames : fieldNames[0]
    return safeGetMultiple(this.state.values.value, names)
  }

  unmount() {
    this.unmountActions.forEach((action) => action())
  }

  register<T extends TParsedForm['keys']>(
    name: T,
    options: RegisterOptions<TValues, T> = {},
  ): RegisterResult {
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

    const unregisterElement = () => this.unregisterElement(name, options)

    this.unmountActions.push(unregisterElement)

    const props: RegisterResult = {
      registerElement: (element) => this.registerElement(name, element, options),
      unregisterElement,
    }

    if (existingField) {
      this.updateDisabledField({ field, disabled: options.disabled, name })
      return props
    }

    const defaultValue =
      safeGet(this.state.values.value, name) ??
      options.value ??
      safeGet(this.state.defaultValues.value, name)

    this.state.values.update((values) => {
      deepSet(values, name, defaultValue)
      return values
    })

    // TODO: not sure what's the best way to preserve this semantic.
    // if (this.state.component.value.mounted) {
    //   this.updateValid()
    // }

    this.updateValid()

    return props
  }

  unregister<T extends TParsedForm['keys']>(
    name?: T | T[] | readonly T[],
    options: UnregisterOptions = {},
  ): void {
    const nameArray = (Array.isArray(name) ? name : name ? [name] : this.names.mount) as string[]

    for (const fieldName of nameArray) {
      this.names.mount.delete(fieldName)
      this.names.array.delete(fieldName)

      if (!options.keepValue) {
        deepUnset(this.fields, fieldName)

        this.state.values.update((values) => {
          deepUnset(values, fieldName)
          return values
        })
      }

      if (!options.keepError) {
        this.state.errors.update((errors) => {
          deepUnset(errors, fieldName)
          return errors
        })
      }

      if (!options.keepDirty) {
        this.state.dirtyFields.update((dirtyFields) => {
          deepUnset(dirtyFields, fieldName)
          return dirtyFields
        })

        this.state.isDirty.set(this.getDirty())
      }

      if (!options.keepTouched) {
        this.state.touchedFields.update((touchedFields) => {
          deepUnset(touchedFields, fieldName)
          return touchedFields
        })
      }

      if (!this.options.shouldUnregister && !options.keepDefaultValue) {
        this.state.defaultValues.update((defaultValues) => {
          deepUnset(defaultValues, fieldName)
          return defaultValues
        })
      }
    }

    if (!options.keepIsValid) {
      this.updateValid()
    }
  }

  /**
   * Register an HTML input element.
   */
  registerElement<T extends TParsedForm['keys']>(
    name: T,
    element: HTMLInputElement,
    options: RegisterOptions<TValues, T> = {},
  ): void {
    this.register(name, options)

    const field: Field | undefined = safeGet(this.fields, name)

    const newField = mergeElementWithField(name, field, element)

    deepSet(this.fields, name, newField)

    const defaultValue =
      safeGet(this.state.values.value, name) ?? safeGet(this.state.defaultValues.value, name)

    if (defaultValue == null || (newField._f.ref as HTMLInputElement)?.defaultChecked) {
      this.state.values.update((values) => {
        deepSet(values, name, getFieldValue(newField._f))
        return values
      })
    } else {
      this.setFieldValue(name, defaultValue)
    }

    element.name = name

    // TODO: what are the equivalent DOM events for React's "onChange" prop?
    element.addEventListener('change', this.handleChange.bind(this))
    element.addEventListener('blur', this.handleChange.bind(this))
    element.addEventListener('input', this.handleChange.bind(this))

    // TODO: not sure what's the best way to preserve this semantic.
    // if (this.state.component.value.mounted) {
    //   this.updateValid()
    // }

    this.updateValid()
  }

  /**
   * Unregister a field.
   */
  unregisterElement<T extends TParsedForm['keys']>(
    name: T,
    options: RegisterOptions<TValues, T> = {},
  ): void {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f) {
      field._f.mount = false
    }

    const shouldUnregister = this.options.shouldUnregister || options.shouldUnregister

    if (shouldUnregister && !this.names.array.has(name)) {
      this.names.unMount.add(name)
    }
  }

  async handleChange(event: AnyEvent): Promise<void | boolean> {
    const target = event.target

    const name = target.name

    const field: Field | undefined = safeGet(this.fields, name)

    if (field == null) {
      return
    }

    const fieldValue = getCurrentFieldValue(event, field)

    this.state.values.update((values) => {
      deepSet(values, name, fieldValue)
      return values
    })

    const isBlurEvent = event.type === INPUT_EVENTS.BLUR || event.type === INPUT_EVENTS.FOCUS_OUT

    if (isBlurEvent) {
      field._f.onBlur?.(event)
      // delayErrorCallback(0)
    } else {
      field._f.onChange?.(event)
    }

    if (!isBlurEvent) {
      this.updateDirtyField(name, fieldValue)
    } else {
      this.updateTouchedField(name)
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
        this.submissionValidationMode,
      )

    if (shouldSkipValidation) {
      this.updateValid()
      return
    }

    this.state.isValidating.set(true)

    const result = await this.validate(name)

    if (result.resolverResult) {
      const previousError = lookupError(this.state.errors.value, this.fields, name)

      const error = lookupError(
        result.resolverResult.errors ?? {},
        this.fields,
        previousError.name || name,
      )

      if (field._f.deps) {
        this.trigger(field._f.deps as any)
      }

      error
    }

    if (result.validationResult) {
      const isFieldValueUpdated =
        Number.isNaN(fieldValue) ||
        (fieldValue === safeGet(this.state.values.value, name) ?? fieldValue)

      const error = result.validationResult.errors[name]

      if (isFieldValueUpdated && !error && this.state.isValid.hasSubscribers) {
        const fullResult = await this.validate()

        if (fullResult.validationResult?.errors) {
          this.mergeErrors(fullResult.validationResult.errors, fullResult.validationResult.names)
        }

        if (field._f.deps) {
          this.trigger(field._f.deps as any)
        }
      }
    }
  }

  handleSubmit(onValid?: SubmitHandler<TValues>, onInvalid?: SubmitErrorHandler<TValues>) {
    return async (event?: Event) => {
      event?.preventDefault?.()

      // https://deepscan.io/docs/rules/react-missing-event-persist
      // event?.persist?.()

      this.state.isSubmitting.set(true)

      const { isValid, resolverResult, validationResult } = await this.validate()

      const errors = resolverResult?.errors ?? validationResult?.errors ?? {}

      deepUnset(this.state.errors.value, 'root')

      this.mergeErrors(errors)

      if (isValid) {
        const data = structuredClone(resolverResult?.values ?? this.state.values.value) as any
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
    }
  }

  focusError() {
    if (this.options.shouldFocusError) {
      focusFieldBy(this.fields, this.focusFieldByCallback.bind(this), this.names.mount)
    }
  }

  focusFieldByCallback(key?: string | Nullish): boolean {
    return Boolean(key && safeGet(this.state.errors.value, key))
  }

  /**
   * Sets a field's value.
   */
  setFieldValue(name: string, value: unknown, options: SetValueOptions = {}) {
    const field: Field | undefined = safeGet(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    // If the field exists and isn't disabled, then also update the form values.
    if (!fieldReference.disabled) {
      this.state.values.update((values) => {
        deepSet(values, name, getFieldValueAs(value, fieldReference))
        return values
      })
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    updateFieldReference(fieldReference, fieldValue)

    this.touch(name, fieldValue, options)
  }

  /**
   * Touches a field.
   */
  touch(name: string, value?: unknown, options?: SetValueOptions) {
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
   * @remarks Will mutate the touchedFields.
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

  /**
   * Updates a field's disabled status and the corresponding value in the form values.
   */
  updateDisabledField(options: UpdateDisabledFieldOptions): void {
    if (typeof options.disabled !== 'boolean') {
      return
    }

    const value = options.disabled
      ? undefined
      : safeGet(this.state.values.value, options.name) ??
        getFieldValue(options.field?._f ?? safeGet(options.fields, options.name)._f)

    this.state.values.update((values) => {
      deepSet(values, options.name, value)
      return values
    })

    this.updateDirtyField(options.name, value)
  }

  /**
   * Updates a field's dirty status.
   *
   * @remarks Will mutate dirtyFields and isDirty.
   *
   * @returns Whether the field's dirty status changed.
   */
  updateDirtyField(name: string, value?: unknown): boolean {
    const defaultValue = safeGet(this.state.defaultValues.value, name)

    // The field will be dirty if its value is different from its default value.
    const currentIsDirty = !deepEqual(defaultValue, value)

    const previousIsDirty = Boolean(safeGet(this.state.dirtyFields.value, name))

    this.state.isDirty.set(currentIsDirty)

    // The field is turning dirty to clean.
    if (previousIsDirty && !currentIsDirty) {
      this.state.dirtyFields.update((dirtyFields) => {
        deepUnset(dirtyFields, name)
        return dirtyFields
      })
    }

    // The field is turning clean to dirty.
    if (!previousIsDirty && currentIsDirty) {
      this.state.dirtyFields.update((dirtyFields) => {
        deepSet(dirtyFields, name, true)
        return dirtyFields
      })
    }

    return currentIsDirty !== previousIsDirty
  }

  /**
   * Updates whether the form is valid.
   *
   * Saves on computation by only updating if the store has subscribers.
   *
   * @param force Whether to force the validation and the store to update and notify subscribers.
   */
  async updateValid(force?: boolean): Promise<void> {
    if (!force && !this.state.isValid.hasSubscribers) {
      return
    }

    const result = await this.validate()

    this.state.isValid.set(result.isValid)
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
  async validate(
    name?: string | string[] | Nullish,
  ): Promise<
    | { isValid: boolean; validationResult: NativeValidationResult; resolverResult?: undefined }
    | { isValid: boolean; validationResult?: undefined; resolverResult: ResolverResult<TValues> }
  > {
    const nameArray = (name == null || Array.isArray(name) ? name : [name]) as string[] | undefined

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate(nameArray)

      const isValid = validationResult.valid

      return { validationResult, isValid }
    } else {
      const resolverOptions = getResolverOptions(
        nameArray ?? this.names.mount,
        this.fields,
        this.options.criteriaMode,
        this.options.shouldUseNativeValidation,
      )

      const resolverResult = await this.options.resolver(
        this.state.values.value,
        this.options.context,
        resolverOptions,
      )

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

    const validationResult = await nativeValidateFields(fields, this.state.values.value, {
      shouldOnlyCheckValid,
      shouldUseNativeValidation: this.options.shouldUseNativeValidation,
      shouldDisplayAllAssociatedErrors: this.options.shouldDisplayAllAssociatedErrors,
      isFieldArrayRoot: (name) => this.names.array.has(name),
    })

    return validationResult
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
  mergeErrors(errors: FieldErrors<TValues> | InternalFieldErrors, names?: string[]): void {
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

  getDirty() {
    return !deepEqual(this.state.defaultValues.value, this.state.values.value)
  }

  async trigger(
    name?: TParsedForm['keys'] | TParsedForm['keys'][] | readonly TParsedForm['keys'][],
    options?: TriggerOptions,
  ) {
    this.state.isValidating.set(true)

    this.updateValid()

    const result = await this.validate(name as any)

    if (result.validationResult) {
      this.mergeErrors(result.validationResult?.errors ?? {}, result.validationResult?.names)
    }

    if (result.resolverResult) {
      this.mergeErrors(result.resolverResult?.errors ?? {})
    }

    this.state.isValid.set(result.isValid)

    this.state.isValidating.set(false)

    if (options?.shouldFocus && !result.isValid) {
      this.focusError()
    }
  }

  /**
   * Renders the form.
   */
  render() {
    this.removeUnmounted()
  }

  /**
   * Remove unmounted fields.
   */
  removeUnmounted() {
    if (!this.names.unMount.size) {
      return
    }

    for (const name of this.names.unMount) {
      const field: Field | undefined = safeGet(this.fields, name)

      const noCheckboxesLive =
        field?._f &&
        (field._f.refs
          ? field._f.refs.every((ref) => !elementIsLive(ref))
          : !elementIsLive(field._f.ref))

      if (noCheckboxesLive) {
        this.unregister(name as any)
      }
    }

    this.names.unMount = new Set()
  }
}
