import {
  type CriteriaMode,
  type SubmissionValidationMode,
  VALIDATION_EVENTS,
  type ValidationEvent,
  type RevalidationEvent,
} from './constants'
import type { FieldErrors } from './types/errors'
import type { Field, FieldRecord } from './types/fields'
import type { ParseForm } from './types/form'
import type { Resolver } from './types/resolver'
import type { DeepMap } from './utils/deep-map'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults } from './utils/defaults'

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
  name?: TParsedForm['keys'] | TParsedForm['keys'][]
  control?: FormControl<T>
  disabled?: boolean
  exact?: boolean
}

/**
 * Default form control options.
 */
export const defaultFormControlOptions: FormControlOptions<any, any> = {
  validationEvent: VALIDATION_EVENTS.onSubmit,
  revalidationEvent: VALIDATION_EVENTS.onChange,
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
  ttransformedValues?: TTransformedValues

  context?: TContext

  options?: FormControlOptions<TValues, TContext>

  constructor(options?: FormControlOptions<TValues, TContext>) {
    this.options = {
      validationEvent: defaultFormControlOptions.validationEvent,
      revalidationEvent: defaultFormControlOptions.revalidationEvent,
      shouldFocusError: defaultFormControlOptions.shouldFocusError,
      ...options,
    }
  }

  register(): any

  register<T extends TParsedForm['keys']>(key: T): any

  register<T extends TParsedForm['keys'][]>(keys: T): any

  register(...args: any[]): any {
    return args
  }
}
