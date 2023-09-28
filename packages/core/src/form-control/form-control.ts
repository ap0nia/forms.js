import { VALIDATION_MODE } from '../constants'
import { getFieldValue } from '../logic/fields/get-field-value'
import { getValidationModes } from '../logic/validation/get-validation-modes'
import { Writable } from '../store'
import type { Field, FieldRecord } from '../types/fields'
import { deepEqual } from '../utils/deep-equal'
import { deepSet } from '../utils/deep-set'
import { deepUnset } from '../utils/deep-unset'
import { isObject } from '../utils/is-object'
import type { Noop } from '../utils/noop'
import { safeGet, safeGetMultiple } from '../utils/safe-get'

import type { UpdateDisabledFieldOptions } from './types'
import type { GetValues } from './types/get-values'
import type { FormControlOptions } from './types/options'
import type { SetError } from './types/set-error'
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

  /**
   * Set an error.
   */
  setError: SetError<TValues> = (name, error, options) => {
    const field: Field | undefined = safeGet(this.fields, name)

    this.state.errors.update((errors) => {
      deepSet(errors, name, { ...error, ref: field?._f?.ref })
      return errors
    })

    this.state.isValid.set(false)

    if (options?.shouldFocus) {
      field?._f?.ref?.focus?.()
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
}
