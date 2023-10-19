import { RecordDerived, Writable } from '@forms.js/common/store'
import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { deepFilter } from '@forms.js/common/utils/deep-filter'
import { deepSet } from '@forms.js/common/utils/deep-set'
import { deepUnset } from '@forms.js/common/utils/deep-unset'
import { isBrowser } from '@forms.js/common/utils/is-browser'
import { isEmptyObject } from '@forms.js/common/utils/is-object'
import { isPrimitive } from '@forms.js/common/utils/is-primitive'
import type { Noop } from '@forms.js/common/utils/noop'
import type { Nullish } from '@forms.js/common/utils/null'
import { safeGet, safeGetMultiple } from '@forms.js/common/utils/safe-get'
import { toStringArray } from '@forms.js/common/utils/to-string-array'

import {
  type CriteriaMode,
  type SubmissionValidationMode,
  VALIDATION_EVENTS,
  type ValidationEvent,
  type RevalidationEvent,
  INPUT_EVENTS,
} from './constants'
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
import type { ParseForm } from './types/form'
import type { InputElement } from './types/html'
import type { RegisterOptions } from './types/register'
import type { Resolver } from './types/resolver'
import type { DeepMap } from './utils/deep-map'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults } from './utils/defaults'
import type { KeysToProperties } from './utils/keys-to-properties'
import type { LiteralUnion } from './utils/literal-union'

/**
 * The form control's state.
 */
export type FormControlState<T> = {
  /**
   * Whether any of the fields have been modified.
   */
  isDirty: boolean

  /**
   * Whether the form is currently loading its default values.
   *
   * i.e. Whether {@link defaultValues} is a promise or a function that returned a promise.
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
   * Whether to disable the form.
   */
  disabled: boolean

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

  /**
   * The current values of the form.
   */
  values: T
}

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
export type FormControlOptions<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
> = {
  /**
   * When to validate the form.
   */
  mode?: ValidationEvent[keyof ValidationEvent]

  /**
   * When to revalidate the form.
   */
  reValidateMode?: RevalidationEvent[keyof RevalidationEvent]

  /**
   * Whether the entire form is disabled.
   */
  disabled?: boolean

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
  resolver?: Resolver<TValues, TContext>

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
}

/**
 * Internally, the initial form control options are transformed before being saved.
 *
 * @todo
 */
export type ResolvedFormControlOptions<
  TValues extends Record<string, any>,
  TContext,
> = FormControlOptions<TValues, TContext> & {
  /**
   * Whether to continue validating after the first error is found.
   *
   * Derived from {@link criteriaMode}.
   */
  shouldDisplayAllAssociatedErrors: boolean

  /**
   * Which events to validate on before/after submission.
   *
   * Derived from {@link mode} and {@link revalidateMode}.
   */
  submissionValidationMode: SubmissionValidationMode

  /**
   * Whether to capture dirty fields.
   *
   * Derived from {@link resetOptions}.
   */
  shouldCaptureDirtyFields: boolean
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
 * Options when triggering a field.
 */
export type TriggerOptions = {
  /**
   * Whether to focus on the field.
   */
  shouldFocus?: boolean

  /**
   * Whether to also update the form control's errors and notify subscribers.
   */
  shouldSetErrors?: boolean
}

/**
 */
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
   * Whether the form should be validated after.
   */
  shouldValidate?: boolean

  /**
   * Whether the changed field should be marked as dirty.
   */
  shouldDirty?: boolean

  /**
   * Whether the changed field should be marked as touched.
   */
  shouldTouch?: boolean

  /**
   * Whether to not notify subscribers.
   */
  quiet?: boolean
}

/**
 * A form submit event handler.
 */
export type HandlerCallback = (event?: Event) => Promise<void>

/**
 * Handles the form submission event if it was successful.
 */
export type SubmitHandler<T, TTransformed> = TTransformed extends Record<string, any>
  ? (data: TTransformed, event?: Event) => unknown
  : (data: T, event?: Event) => unknown

/**
 * Handles the form submission event if errors occurred.
 */
export type SubmitErrorHandler<T> = (errors: FieldErrors<T>, event?: Event) => unknown

/**
 * Options when watching an input.
 */
export type WatchOptions<
  T extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<T> = ParseForm<T>,
> = {
  /**
   * The name of the field to watch.
   */
  name?: TParsedForm['keys'] | TParsedForm['keys'][]

  /**
   * A form control to use instead of the default one.
   */
  control?: FormControl<T>

  /**
   * Whether watching is disabled (when disabled, subscribers won't be notified on changes).
   */
  disabled?: boolean

  /**
   * Whether to watch the exact field name, or include similar fields (i.e. field arrays).
   */
  exact?: boolean
}

/**
 * Default form control options.
 */
export const defaultFormControlOptions: FormControlOptions<any, any> = {
  /**
   * By default, validate the form for the first time when it's submitted.
   */
  mode: VALIDATION_EVENTS.onSubmit,

  /**
   * After the form's been validated for the first time, revalidate it when any field changes.
   */
  reValidateMode: VALIDATION_EVENTS.onChange,

  /**
   * The input that caused errors will be focused.
   */
  shouldFocusError: true,
}

/**
 * The core functionality of the library is encompassed by a form control that controls field/form behavior.
 */
export class FormControl<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
> {
  /**
   * TODO: remove this
   */
  ttransformedValues?: TTransformedValues

  /**
   * The resolved options that the form control is using.
   *
   * @public
   */
  options: ResolvedFormControlOptions<TValues, TContext>

  /**
   * The current state of the form. All top-level properties are observables.
   *
   * @public
   */
  state: { [K in keyof FormControlState<TValues>]: Writable<FormControlState<TValues>[K]> }

  /**
   * State that's derived from {@link state} and lazily updates subscribers depending on
   * which keys have been accessed via its proxy.
   *
   * @public
   */
  derivedState: RecordDerived<this['state']>

  /**
   * Whether the form control has been mounted.
   */
  mounted = false

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
    /**
     * Mounted (registered) fields.
     */
    mount: new Set<string>(),

    /**
     * Unmounted (unregistered) fields that are waiting to be removed.
     */
    unMount: new Set<string>(),

    /**
     * Registered field arrays.
     */
    array: new Set<string>(),
  }

  /**
   * Callbacks to invoke when the form control unmounts.
   */
  unmountActions: Noop[] = []

  /**
   * Callbacks to invoke when the form control's values are changed via "reset" or "setValue".
   *
   * Mostly for field arrays that need to update their internal state when this occurs.
   */
  valueListeners: Noop[] = []

  constructor(options?: FormControlOptions<TValues, TContext>) {
    this.options = {
      mode: defaultFormControlOptions.mode,
      reValidateMode: defaultFormControlOptions.reValidateMode,
      shouldFocusError: defaultFormControlOptions.shouldFocusError,
      shouldDisplayAllAssociatedErrors: options?.criteriaMode === VALIDATION_EVENTS.all,
      submissionValidationMode: {
        beforeSubmission: getValidationMode(options?.mode),
        afterSubmission: getValidationMode(options?.reValidateMode),
      },
      shouldCaptureDirtyFields: Boolean(options?.resetOptions?.keepDirtyValues),
      ...options,
    }

    // Default values that might be resolving (i.e. if they're a promise)
    const initialDefaultValues =
      typeof options?.defaultValues === 'function'
        ? options.defaultValues()
        : options?.defaultValues

    // Default values are loading if they're a promise.
    const isLoading = initialDefaultValues instanceof Promise

    // The final default values fall back to values and then an empty object.
    const defaultValues: any =
      (!isLoading && structuredClone(initialDefaultValues)) ||
      structuredClone(options?.values ?? {})

    this.state = {
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

    this.derivedState = new RecordDerived(this.state, new Set())

    /**
     * Ensure that default values are handled.
     */
    if (isLoading) {
      this.resetDefaultValues(initialDefaultValues, true)
    }
  }

  //--------------------------------------------------------------------------------------
  // Actions.
  //--------------------------------------------------------------------------------------

  /**
   * Determines whether the store is currently dirty. Does not update the state.
   */
  getDirty(): boolean {
    return !deepEqual(this.state.defaultValues.value, this.state.values.value)
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

  //--------------------------------------------------------------------------------------
  // Getters and observers.
  //--------------------------------------------------------------------------------------

  /**
   * Alias for react-hook-form's "control._fields" property.
   */
  get _fields() {
    return this.fields
  }

  /**
   * Before doing some operations, the form control checks if there are actually any subscribers
   * for that state, and skips the operation if there aren't.
   */
  isTracking(key: keyof typeof this.state, name?: string[]) {
    return (
      this.derivedState.isTracking(key, name) ||
      this.derivedState.clonesAreTracking(key, name) ||
      this.state[key].subscribers.size
    )
  }

  /**
   * Get all the form's values.
   */
  getValues(): TValues

  /**
   * Get the value of a single field.
   */
  getValues<T extends TParsedForm['keys']>(field: T): TParsedForm['values'][T]

  /**
   * Get the values of multiple fields in an array format.
   */
  getValues<T extends TParsedForm['keys'][]>(fields: T): KeysToProperties<TParsedForm['values'], T>

  /**
   * Get the values of multiple fields in an array format.
   */
  getValues<T extends TParsedForm['keys'][]>(
    ...fields: T
  ): KeysToProperties<TParsedForm['values'], T>

  /**
   * Implementation of {@link getValues}.
   */
  getValues(...args: any[]): any {
    const names = args.length > 1 ? args : args[0]
    return safeGetMultiple(this.state.values.value, names)
  }

  watch(): TValues

  watch(callback: (data: any, context: { name?: string; type?: string }) => void): () => void

  watch<T extends TParsedForm['keys']>(
    name: T,
    defaultValues?: DeepPartial<TValues>,
    options?: WatchOptions<TValues>,
  ): TParsedForm['values'][T]

  watch<T extends TParsedForm['keys'][]>(
    name: T,
    defaultValues?: DeepPartial<TParsedForm['values']>,
    options?: WatchOptions<TValues>,
  ): KeysToProperties<TParsedForm['values'], T>

  watch(...args: any[]): any {
    if (typeof args[0] === 'function') {
      return () => {
        this.derivedState.subscribe((state, context) => {
          return args[0](state, context ?? this.options.context)
        })
      }
    }

    const [name, _defaultValues, options] = args

    const nameArray = Array.isArray(name) ? name : name ? [name] : []

    if (nameArray.length > 0) {
      this.derivedState.track('values', nameArray, options)
    } else {
      this.derivedState.keys?.add('values')
    }

    return nameArray.length > 1
      ? deepFilter({ ...this.state.values.value }, nameArray)
      : safeGet({ ...this.state.values.value }, name)
  }

  /**
   * Get the state of a field.
   */
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

  //--------------------------------------------------------------------------------------
  // DOM API
  //--------------------------------------------------------------------------------------

  /**
   * Handles a change event from an input element.
   */
  async handleChange(event: Event): Promise<void> {
    this.derivedState.freeze()

    const target: any = event.target

    const name = target.name

    const field: Field | undefined = safeGet(this.fields, name)

    if (field == null) {
      return
    }

    const fieldValue = getCurrentFieldValue(event, field)

    this.state.values.update(
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
      this.updateValid()
      this.derivedState.unfreeze()
      return
    }

    if (!isBlurEvent) {
      this.derivedState.unfreeze()
      this.derivedState.freeze()
    }

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

      if (currentError.error) {
        deepSet(this.state.errors.value, currentError.name, currentError.error)
      } else {
        deepUnset(this.state.errors.value, currentError.name)
      }

      if (field._f.deps) {
        this.trigger(field._f.deps as any)
      } else {
        this.state.isValid.set(result.isValid, [name])
      }

      // Previously, errors were mutated without notifying subscribers.
      // After everything is done, notify subscribers once.
      this.state.errors.update((errors) => ({ ...errors }), [name])
    }

    if (result.validationResult) {
      const isFieldValueUpdated =
        Number.isNaN(fieldValue) ||
        (fieldValue === safeGet(this.state.values.value, name) ?? fieldValue)

      if (!result.isValid) {
        const error = result.validationResult.errors[name]

        if (isFieldValueUpdated && !error) {
          const fullResult = await this.validate()

          if (fullResult.validationResult?.errors) {
            this.mergeErrors(fullResult.validationResult.errors, fullResult.validationResult.names)
          }
        } else {
          deepSet(this.state.errors.value, name, error)
        }
      } else {
        this.mergeErrors(result.validationResult.errors, result.validationResult.names)
      }

      if (isFieldValueUpdated && field._f.deps) {
        this.trigger(field._f.deps as any)
      } else {
        this.state.isValid.set(result.isValid, [name])
      }

      // Previously, errors were mutated without notifying subscribers.
      // After everything is done, notify subscribers once.
      this.state.errors.update((errors) => ({ ...errors }), [name])
    }

    this.state.isValidating.set(false, [name])
    this.derivedState.unfreeze()
  }

  /**
   */
  handleSubmit(
    onValid?: SubmitHandler<TValues, TTransformedValues>,
    onInvalid?: SubmitErrorHandler<TValues>,
  ): HandlerCallback {
    return async (event) => {
      this.derivedState.freeze()

      event?.preventDefault?.()

      this.state.isSubmitting.set(true)

      const { isValid, resolverResult, validationResult } = await this.validate()

      const errors = resolverResult?.errors ?? validationResult?.errors ?? {}

      deepUnset(this.state.errors.value, 'root')

      this.mergeErrors(errors)
      this.state.errors.update((errors) => ({ ...errors }))

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

      this.derivedState.unfreeze()
    }
  }

  /**
   * Register an HTML input element.
   *
   * @remarks MUST NOT NOTIFY ANY SIGNAL LISTENERS BECAUSE REACT SUCKS.
   */
  registerElement<T extends TParsedForm['keys']>(
    name: Extract<T, string>,
    element: InputElement,
    options?: RegisterOptions<TValues, T>,
  ): void {
    const field = this.registerField(name, options)

    const fieldNames = toStringArray(name)

    const newField = mergeElementWithField(name, field, element)

    const defaultValue =
      safeGet(this.state.values.value, name) ?? safeGet(this.state.defaultValues.value, name)

    if (defaultValue == null || (newField._f.ref as HTMLInputElement)?.defaultChecked) {
      deepSet(this.state.values.value, name, getFieldValue(newField._f))
    } else {
      updateFieldReference(newField._f, defaultValue)
    }

    deepSet(this.fields, name, newField)

    this.updateValid(undefined, fieldNames)
  }

  /**
   * @remarks MUST NOT NOTIFY ANY SIGNAL SUBSCRIBERS BECAUSE REACT SUCKS.
   */
  registerField<T extends TParsedForm['keys']>(
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
      safeGet(this.state.values.value, name) ??
      options?.value ??
      safeGet(this.state.defaultValues.value, name)

    deepSet(this.state.values.value, name, defaultValue)

    return field
  }

  /**
   * Unregister a field.
   */
  unregister<T extends TParsedForm['keys']>(
    name?: Extract<T, string> | Extract<T, string>[],
    options?: UnregisterOptions,
  ): void {
    this.derivedState.freeze()

    const fieldNames = toStringArray(name) ?? Array.from(this.names.mount)

    for (const fieldName of fieldNames) {
      this.names.mount.delete(fieldName)
      this.names.array.delete(fieldName)

      if (!options?.keepValue) {
        deepUnset(this.fields, fieldName)

        this.state.values.update((values) => {
          deepUnset(values, fieldName)
          return values
        }, fieldNames)
      }

      if (!options?.keepError) {
        this.state.errors.update((errors) => {
          deepUnset(errors, fieldName)
          return errors
        }, fieldNames)
      }

      if (!options?.keepDirty) {
        this.state.dirtyFields.update((dirtyFields) => {
          deepUnset(dirtyFields, fieldName)
          return dirtyFields
        }, fieldNames)

        this.state.isDirty.set(this.getDirty(), fieldNames)
      }

      if (!options?.keepTouched) {
        this.state.touchedFields.update((touchedFields) => {
          deepUnset(touchedFields, fieldName)
          return touchedFields
        }, fieldNames)
      }

      if (!this.options.shouldUnregister && !options?.keepDefaultValue) {
        this.state.defaultValues.update((defaultValues) => {
          deepUnset(defaultValues, fieldName)
          return defaultValues
        }, fieldNames)
      }
    }

    if (!options?.keepIsValid) {
      this.updateValid(undefined, fieldNames)
    }

    this.derivedState.unfreeze(true)
  }

  /**
   * Prepares an element to be unregistered.
   * {@link cleanup} or {@link unmount} must be called to fully complete the unregistration.
   */
  unregisterElement<T extends TParsedForm['keys']>(
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

  mount() {
    this.mounted = true
  }

  unmount() {
    this.mounted = false
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

  //--------------------------------------------------------------------------------------
  // Validation.
  //--------------------------------------------------------------------------------------

  /**
   * Updates whether the form is valid.
   *
   * Saves on computation by only updating if the store has subscribers.
   *
   * @param force Whether to force the validation and the store to update and notify subscribers.
   */
  async updateValid(force?: boolean, name?: string | string[]): Promise<void> {
    if (force || this.isTracking('isValid', toStringArray(name))) {
      const result = await this.validate()

      const fieldNames = toStringArray(name)

      this.state.isValid.set(result.isValid, fieldNames)
    }
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
    const nameArray = toStringArray(name)

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate(nameArray)

      const isValid = validationResult.valid

      return { validationResult, isValid }
    }

    const names = nameArray ?? Array.from(this.names.mount)

    const fields = filterFields(names, this.fields)

    const resolverResult = await this.options.resolver(
      this.state.values.value,
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

  //--------------------------------------------------------------------------------------
  // Setters and updaters.
  //--------------------------------------------------------------------------------------

  /**
   * Sets one field value.
   */
  setValue<T extends TParsedForm['keys']>(
    name: Extract<T, string>,
    value: TParsedForm['values'][T],
    options?: SetValueOptions,
  ): void {
    this.derivedState.freeze()

    const field: Field | undefined = safeGet(this.fields, name)

    const fieldNames = toStringArray(name)

    const clonedValue = structuredClone(value)

    if (options?.quiet) {
      deepSet(this.state.values.value, name, clonedValue)
    } else {
      this.state.values.update((values) => {
        deepSet(values, name, clonedValue)
        return values
      }, fieldNames)
    }

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
          getDirtyFields(this.state.defaultValues.value, this.state.values.value),
          fieldNames,
        )
        this.state.isDirty.set(this.getDirty(), fieldNames)
      }
    }

    this.valueListeners.forEach((listener) => listener())

    this.derivedState.unfreeze()
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
        this.setFieldValue(fieldName, fieldValue, options)
      }
    }

    this.derivedState.unfreeze()
  }

  /**
   * Sets a field's value.
   */
  setFieldValue(name: string, value: unknown, options?: SetValueOptions): void {
    this.derivedState.freeze()

    const field: Field | undefined = safeGet(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    updateFieldReference(fieldReference, fieldValue)

    // If the field exists and isn't disabled, then also update the form values.
    if (!fieldReference.disabled) {
      this.state.values.update(
        (values) => {
          deepSet(values, name, getFieldValueAs(value, fieldReference))
          return values
        },
        [name],
      )
    }

    this.touch(name, fieldValue, options)

    if (options?.shouldValidate) {
      this.trigger(name as any)
    }

    this.derivedState.unfreeze()
  }

  /**
   * Trigger a field.
   */
  async trigger<T extends TParsedForm['keys']>(
    name?: T | T[] | readonly T[],
    options?: TriggerOptions,
  ): Promise<boolean> {
    /**
     * Freeze the derived state until the end of this method so it updates multiple values at once.
     */
    this.derivedState.freeze()

    const fieldNames = toStringArray(name)

    this.derivedState.transaction(() => {
      this.state.isValidating.set(true, fieldNames)
    })

    const result = await this.validate(name as any)

    if (result.validationResult) {
      this.mergeErrors(result.validationResult.errors, result.validationResult.names)
    }

    if (result.resolverResult?.errors) {
      this.mergeErrors(result.resolverResult.errors)
    }

    this.state.isValid.set(result.isValid, fieldNames)

    this.derivedState.transaction(() => {
      this.state.isValidating.set(false, fieldNames)
    })

    if (options?.shouldFocus && !result.isValid) {
      const callback = (key?: string) => key && safeGet(this.state.errors.value, key)
      focusFieldBy(this.fields, callback, name ? fieldNames : this.names.mount)
    }

    if (options?.shouldSetErrors) {
      this.state.errors.update((errors) => ({ ...errors }), fieldNames)
    }

    this.derivedState.unfreeze()

    return result.isValid
  }

  /**
   * Set an error.
   */
  setError<T extends TParsedForm['keys']>(
    name: T | 'root' | `root.${string}`,
    error?: ErrorOption,
    options?: TriggerOptions,
  ): void {
    this.derivedState.freeze()

    const field: Field | undefined = safeGet(this.fields, name)

    const fieldNames = toStringArray(name)

    this.state.errors.update((errors) => {
      deepSet(errors, name, { ...error, ref: field?._f?.ref })
      return errors
    }, fieldNames)

    this.state.isValid.set(false, fieldNames)

    if (options?.shouldFocus) {
      field?._f?.ref?.focus?.()
    }

    this.derivedState.unfreeze()
  }

  /**
   * Merges errors into the form state's errors.
   *
   * Errors from a resolver or native validator can be generated without updating the form state.
   * This method merges those errors into form state's errors store **WITHOUT** notifying subscribers.
   *
   * The names array is helpful for capturing names of fields with removed errors.
   *
   * @param errors The errors into the form state's errors.
   * @param names The names of the affected fields.
   */
  mergeErrors(errors: FieldErrors<TValues> | FieldErrorRecord, names?: string[]): void {
    const namesToMerge = names ?? Object.keys(errors)

    const currentErrors = this.state.errors.value

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

    this.state.errors.value = newErrors
  }

  /**
   * Clear the form's errors.
   */
  clearErrors(name?: string | string[]) {
    if (name == null) {
      this.state.errors.set({})
      return
    }

    const nameArray = toStringArray(name)

    this.state.errors.update((errors) => {
      nameArray?.forEach((name) => deepUnset(this.state.errors.value, name))
      return errors
    }, nameArray)
  }

  /**
   * Touches a field.
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
   * @returns Whether the field's touched status changed.
   */
  updateTouchedField(name: string): boolean {
    const previousIsTouched = safeGet(this.state.touchedFields.value, name)

    if (!previousIsTouched) {
      this.state.touchedFields.update(
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
   * Updates a field's dirty status.
   *
   * @returns Whether the field's dirty status changed.
   */
  updateDirtyField(name: string, value?: unknown): boolean {
    const { previousIsDirty, currentIsDirty, isDirty } = this.mockUpdateDirtyField(name, value)

    if (this.state.isDirty.value !== isDirty) {
      this.state.isDirty.set(currentIsDirty, [name])
    }

    if (currentIsDirty != previousIsDirty) {
      this.state.dirtyFields.update((dirtyFields) => ({ ...dirtyFields }), [name])
    }

    return currentIsDirty !== previousIsDirty
  }

  /**
   * Updates a field's disabled status and the corresponding value in the form values.
   */
  updateDisabledField(options: UpdateDisabledFieldOptions): void {
    const changed = this.mockUpdateDisabledField(options)

    if (changed) {
      this.derivedState.freeze()

      this.state.values.update((values) => ({ ...values }))

      this.state.dirtyFields.update((dirtyFields) => ({ ...dirtyFields }))

      this.derivedState.unfreeze()
    }
  }

  /**
   * Updates the form control's values and dirty states **WITHOUT** notifying subscribers.
   *
   * @remarks This is used during registration to prevent infinite setState loops in React.
   */
  mockUpdateDisabledField(options: UpdateDisabledFieldOptions): boolean {
    if (typeof options.disabled !== 'boolean') {
      return false
    }

    const value = options.disabled
      ? undefined
      : safeGet(this.state.values.value, options.name) ??
        getFieldValue(options.field?._f ?? safeGet(options.fields, options.name)._f)

    deepSet(this.state.values.value, options.name, value)

    this.mockUpdateDirtyField(options.name, value)

    return true
  }

  /**
   * Updates the form control's values and dirty states **WITHOUT** notifying subscribers.
   *
   * @remarks This is used during registration to prevent infinite setState loops in React.
   */
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

    const isDirty = this.isTracking('isDirty', toStringArray(name))
      ? this.getDirty()
      : this.state.isDirty.value

    return { previousIsDirty, currentIsDirty, isDirty }
  }

  //--------------------------------------------------------------------------------------
  // Resetters.
  //--------------------------------------------------------------------------------------

  /**
   */
  reset(
    formValues?: Defaults<TValues> extends TValues ? TValues : Defaults<TValues>,
    options?: ResetOptions,
  ): void {
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
            deepSet(values, fieldName, safeGet(this.state.values.value, fieldName))
          } else {
            this.setValue(fieldName as any, safeGet(values, fieldName), { quiet: true })
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

      this.derivedState.transaction(() => {
        this.state.values.set(newValues as TValues)
      })
    }

    this.names = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
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

    this.valueListeners.forEach((listener) => listener())

    this.derivedState.unfreeze()
  }

  /**
   * @param resetValues Whether to reset the form's values too.
   */
  async resetDefaultValues(defaults?: Defaults<TValues>, resetValues?: boolean): Promise<void> {
    const resolvingDefaultValues = typeof defaults === 'function' ? defaults() : defaults

    if (resolvingDefaultValues == null) {
      this.state.isLoading.set(false)
      return
    }

    const isPromise = resolvingDefaultValues instanceof Promise

    let resolvedDefaultValues = resolvingDefaultValues

    if (isPromise) {
      this.state.isLoading.set(true)
      resolvedDefaultValues = await resolvingDefaultValues
    }

    this.derivedState.freeze()

    this.state.defaultValues.set((resolvedDefaultValues ?? {}) as any)

    if (resetValues) {
      const newValues = structuredClone(resolvedDefaultValues)
      this.state.values.set(newValues as TValues)
    }

    this.state.isLoading.set(false)

    this.derivedState.unfreeze()
  }
}
