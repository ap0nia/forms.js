import { Batchable, Writable } from '@forms.js/common/store'
import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { deepUnset } from '@forms.js/common/utils/deep-unset'
import { safeGet, safeGetMultiple } from '@forms.js/common/utils/safe-get'
import { toStringArray } from '@forms.js/common/utils/to-string-array'

import { VALIDATION_EVENTS } from './constants'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getValidationMode } from './logic/validation/get-validation-mode'
import type { FieldRecord } from './types/fields'
import type {
  FormControlOptions,
  FormControlState,
  ParseForm,
  ResolvedFormControlOptions,
  TriggerOptions,
} from './types/form'
import type { Defaults } from './utils/defaults'
import type { KeysToProperties } from './utils/keys-to-properties'

export const defaultFormControlOptions: FormControlOptions<any, any> = {
  mode: VALIDATION_EVENTS.onSubmit,
  reValidateMode: VALIDATION_EVENTS.onChange,
  shouldFocusError: true,
}

export class FormControl<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  // TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
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

    if (isLoading) {
      this.resetDefaultValues(initialDefaultValues, true)
    }
  }

  //--------------------------------------------------------------------------------------
  // Getters.
  //--------------------------------------------------------------------------------------

  getDirty(): boolean {
    return !deepEqual(this.state.defaultValues.value, this.state.values.value)
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

  getValues(): TValues

  getValues<T extends TParsedForm['keys']>(field: T): TParsedForm['values'][T]

  getValues<T extends TParsedForm['keys'][]>(fields: T): KeysToProperties<TParsedForm['values'], T>

  getValues<T extends TParsedForm['keys'][]>(
    ...fields: T
  ): KeysToProperties<TParsedForm['values'], T>

  getValues(...args: any[]): any {
    const names = args.length > 1 ? args : args[0]
    return safeGetMultiple(this.state.values.value, names)
  }

  //--------------------------------------------------------------------------------------
  // Interactions.
  //--------------------------------------------------------------------------------------

  focusError(options?: TriggerOptions) {
    if (options?.shouldFocus || (options == null && this.options.shouldFocusError)) {
      focusFieldBy(
        this.fields,
        (key) => key && safeGet(this.state.errors.value, key),
        this.names.mount,
      )
    }
  }

  //--------------------------------------------------------------------------------------
  // Errors.
  //--------------------------------------------------------------------------------------

  clearErrors(name?: string | string[]): void {
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

  //--------------------------------------------------------------------------------------
  // Resetters.
  //--------------------------------------------------------------------------------------

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
      resolvedDefaultValues = (await resolvingDefaultValues) ?? {}
    }

    this.batchedState.open()

    this.state.defaultValues.set(resolvedDefaultValues as any)

    if (resetValues) {
      this.state.values.set(structuredClone(resolvedDefaultValues) as TValues)
    }

    this.state.isLoading.set(false)

    this.batchedState.flush()
  }
}
