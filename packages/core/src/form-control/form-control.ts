import { VALIDATION_MODE } from '../constants'
import { getValidationModes } from '../logic/validation/get-validation-modes'
import { Writable } from '../store'
import type { FieldRecord } from '../types/fields'
import { isObject } from '../utils/is-object'
import type { Noop } from '../utils/noop'
import { safeGetMultiple } from '../utils/safe-get'

import type { GetValues } from './types/get-values'
import type { FormControlOptions } from './types/options'
import type { FormControlState, FormControlStatus } from './types/state'

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

    const defaultValues =
      isObject(resolvedOptions.defaultValues) || isObject(resolvedOptions.values)
        ? structuredClone(resolvedOptions.defaultValues || resolvedOptions.values)
        : {}

    this.options = resolvedOptions

    this.state = {
      submitCount: new Writable(0),
      isDirty: new Writable(false),
      isLoading: new Writable(false),
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
      status: new Writable({ mounted: false } as FormControlStatus),
    }

    /**
     * Ensure that default values are handled.
     */
    // this.resetDefaultValues(true)
  }

  /**
   * Gets the current form control's values.
   */
  getValues: GetValues<TValues> = (...args: any[]): any => {
    const names = args.length > 1 ? args : args[0]
    return safeGetMultiple(this.state.values.value, names)
  }
}
