import {
  type CriteriaMode,
  type RevalidationMode,
  type SubmissionValidationMode,
  type ValidationMode,
} from '../../constants'
import type { Resolver } from '../../types/resolver'
import type { DeepPartial } from '../../utils/types/deep-partial'

import type { KeepStateOptions } from './keep-state'

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
   * Default field values.
   */
  defaultValues?:
    | DeepPartial<TValues>
    | Promise<DeepPartial<TValues>>
    | (() => DeepPartial<TValues> | Promise<DeepPartial<TValues>>)

  /**
   * The actual form values.
   */
  values?: TValues

  /**
   * Which state to preserve when resetting the form.
   */
  resetOptions?: FormControlResetOptions

  /**
   * Override the native validation and process the form directly.
   */
  resolver?: Resolver<TValues, TContext> | Resolver<TValues, TContext>[]

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

export interface FormControlResetOptions extends KeepStateOptions {
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
