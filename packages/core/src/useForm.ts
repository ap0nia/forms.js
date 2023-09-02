import type { ValidationMode, RevalidationMode, CriteriaMode } from './constants'
import type { Resolver } from './resolver'
import type { DeepPartial } from './utils/deep-partial'
import type { MaybeAsyncFunction } from './utils/maybe-async-function'

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

export type UseFormProps<
  TForm extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
  TContext = unknown,
> = {
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
  resetOptions: KeepStateOptions

  /**
   * Validates the form.
   */
  resolver: Resolver<TForm, TContext>

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

/**
 */
export function useForm() {}
