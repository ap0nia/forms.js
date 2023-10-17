import { RecordDerived, Writable } from '@forms.js/common/store'
import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { deepFilter } from '@forms.js/common/utils/deep-filter'
import { deepSet } from '@forms.js/common/utils/deep-set'
import { isEmptyObject } from '@forms.js/common/utils/is-object'
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
} from './constants'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getValidationMode } from './logic/validation/get-validation-mode'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import type { FieldErrors } from './types/errors'
import type { Field, FieldRecord, FieldReference } from './types/fields'
import type { ParseForm } from './types/form'
import type { Resolver } from './types/resolver'
import type { DeepMap } from './utils/deep-map'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults } from './utils/defaults'
import type { KeysToProperties } from './utils/keys-to-properties'

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
  validationEvent?: ValidationEvent[keyof ValidationEvent]

  /**
   * When to revalidate the form.
   */
  revalidationEvent?: RevalidationEvent[keyof RevalidationEvent]

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
  validationEvent: VALIDATION_EVENTS.onSubmit,

  /**
   * After the form's been validated for the first time, revalidate it when any field changes.
   */
  revalidationEvent: VALIDATION_EVENTS.onChange,

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
      validationEvent: defaultFormControlOptions.validationEvent,
      revalidationEvent: defaultFormControlOptions.revalidationEvent,
      shouldFocusError: defaultFormControlOptions.shouldFocusError,
      shouldDisplayAllAssociatedErrors: options?.criteriaMode === VALIDATION_EVENTS.all,
      submissionValidationMode: {
        beforeSubmission: getValidationMode(options?.validationEvent),
        afterSubmission: getValidationMode(options?.revalidationEvent),
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

  //--------------------------------------------------------------------------------------
  // DOM API
  //--------------------------------------------------------------------------------------

  //--------------------------------------------------------------------------------------
  // Validation.
  //--------------------------------------------------------------------------------------

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

    const fields: Record<string, FieldReference> = {}

    for (const name of names) {
      const field: Field | undefined = safeGet(this.fields, name)

      if (field) {
        deepSet(fields, name, field._f)
      }
    }

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
  // Resetters.
  //--------------------------------------------------------------------------------------

  /**
   * @param resetValues Whether to reset the form's values too.
   */
  async resetDefaultValues(defaults?: Defaults<TValues>, resetValues?: boolean): Promise<void> {
    const resolvingDefaultValues = typeof defaults === 'function' ? defaults() : defaults

    if (resolvingDefaultValues == null) {
      // Ensure that the form is not loading.
      this.state.isLoading.set(false)
      return
    }

    const isPromise = resolvingDefaultValues instanceof Promise

    // If the form wasn't loading, it should be now since it's waiting for the default values to resolve.
    if (!this.state.isLoading.value && isPromise) {
      this.state.isLoading.set(true)
    }

    let resolvedDefaultValues = resolvingDefaultValues

    if (isPromise) {
      resolvedDefaultValues = await resolvingDefaultValues
    }

    this.state.defaultValues.set((resolvedDefaultValues ?? {}) as any)

    if (resetValues) {
      const newValues = structuredClone(resolvedDefaultValues)
      this.state.values.set(newValues as TValues)
    }

    // If the form was loading, it should be done now.
    if (this.state.isLoading.value) {
      this.state.isLoading.set(false)
    }
  }
}
