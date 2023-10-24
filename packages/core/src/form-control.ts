import { Batchable, Writable } from '@forms.js/common/store'

import { VALIDATION_EVENTS } from './constants'
import { getValidationMode } from './logic/validation/get-validation-mode'
import type { FieldRecord } from './types/fields'
import type { FormControlOptions, FormControlState, ResolvedFormControlOptions } from './types/form'

export const defaultFormControlOptions: FormControlOptions<any, any> = {
  mode: VALIDATION_EVENTS.onSubmit,
  reValidateMode: VALIDATION_EVENTS.onChange,
  shouldFocusError: true,
}

export class FormControl<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
> {
  options: ResolvedFormControlOptions<TValues, TContext>

  state: { [K in keyof FormControlState<TValues>]: Writable<FormControlState<TValues>[K]> }

  batchedState: Batchable<this['state']>

  mounted = false

  fields: FieldRecord = {}

  names = {
    mount: new Set<string>(),
    unMount: new Set<string>(),
    array: new Set<string>(),
  }

  /**
   * Callbacks that are invoked specifically when {@link setValue} or {@link reset} is called.
   */
  valueListeners: ((newValues: TValues) => unknown)[] = []

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

    const initialDefaultValues =
      typeof options?.defaultValues === 'function'
        ? options.defaultValues()
        : options?.defaultValues

    const isLoading = initialDefaultValues instanceof Promise

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

    this.batchedState = new Batchable(this.state, new Set())

    // if (isLoading) {
    //   this.resetDefaultValues(initialDefaultValues, true)
    // }
  }
}
