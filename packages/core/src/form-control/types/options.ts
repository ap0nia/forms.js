import {
  type CriteriaMode,
  type RevalidationMode,
  type SubmissionValidationMode,
  type ValidationMode,
} from '../../constants'
import type { Plugin } from '../../types/plugin'
import type { Resolver } from '../../types/resolver'
import type { Defaults } from '../../utils/types/defaults'

import type { ResetOptions } from './reset'

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
