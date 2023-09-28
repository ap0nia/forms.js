import { INPUT_EVENTS, VALIDATION_MODE } from '../constants'
import { lookupError } from '../logic/errors/lookup-error'
import { focusFieldBy } from '../logic/fields/focus-field-by'
import { getCurrentFieldValue } from '../logic/fields/get-current-field-value'
import { getDirtyFields } from '../logic/fields/get-dirty-fields'
import { getFieldValue, getFieldValueAs } from '../logic/fields/get-field-value'
import { hasValidation } from '../logic/fields/has-validation'
import { updateFieldReference } from '../logic/fields/update-field-reference'
import { isHTMLElement } from '../logic/html/is-html-element'
import { mergeElementWithField } from '../logic/html/merge-element-with-field'
import { getValidationModes } from '../logic/validation/get-validation-modes'
import { nativeValidateFields } from '../logic/validation/native-validation'
import type { NativeValidationResult } from '../logic/validation/native-validation/types'
import { shouldSkipValidationAfter } from '../logic/validation/should-skip-validation-after'
import { Writable } from '../store'
import type { FieldErrorRecord, FieldErrors } from '../types/errors'
import type { Field, FieldRecord } from '../types/fields'
import type { RegisterResult } from '../types/register'
import { deepEqual } from '../utils/deep-equal'
import { deepFilter } from '../utils/deep-filter'
import { deepSet } from '../utils/deep-set'
import { deepUnset } from '../utils/deep-unset'
import { isBrowser } from '../utils/is-browser'
import { isEmptyObject, isObject } from '../utils/is-object'
import { isPrimitive } from '../utils/is-primitive'
import type { Noop } from '../utils/noop'
import type { Nullish } from '../utils/null'
import { safeGet, safeGetMultiple } from '../utils/safe-get'
import type { DeepPartial } from '../utils/types/deep-partial'
import type { Defaults } from '../utils/types/defaults'

import type { GetValues } from './types/get-values'
import type { FormControlOptions } from './types/options'
import type { Register, RegisterElement } from './types/register'
import type { Reset } from './types/reset'
import type { SetError } from './types/set-error'
import type { SetValue, SetValueOptions } from './types/set-value'
import type { FormControlState, FormControlStatus } from './types/state'
import type { HandleSubmit } from './types/submit'
import type { Trigger, TriggerOptions } from './types/trigger'
import type { Unregister, UnregisterElement } from './types/unregister'
import type { UpdateDisabledFieldOptions } from './types/update-disabled-field'

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

    // Default values are defined if they're a concrete (non-promise) object.
    const isDefaultValuesDefined =
      !(resolvedOptions.defaultValues instanceof Promise) && isObject(resolvedOptions.defaultValues)

    // Default values fallsback to values and then an empty object.
    const defaultValues =
      (isDefaultValuesDefined && structuredClone(options?.defaultValues)) ||
      structuredClone(resolvedOptions.values ?? {})

    /**
     * Possibly a promise that's resolving the default values.
     */
    const resolvingDefaultValues =
      typeof resolvedOptions.defaultValues === 'function'
        ? resolvedOptions.defaultValues()
        : resolvedOptions.defaultValues

    this.options = resolvedOptions

    this.state = {
      submitCount: new Writable(0),
      isDirty: new Writable(false),
      isLoading: new Writable(resolvingDefaultValues instanceof Promise),
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
      status: new Writable({ init: true, mount: false } as FormControlStatus),
    }

    resolvedOptions.plugins?.forEach((plugin) => {
      plugin.onInit?.(this)
    })

    /**
     * Ensure that default values are handled.
     */
    this.resetDefaultValues(resolvingDefaultValues, true)
  }

  /**
   * Gets the current form control's values.
   */
  getValues: GetValues<TValues> = (...args: any[]): any => {
    const names = args.length > 1 ? args : args[0]
    return safeGetMultiple(this.state.values.value, names)
  }

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

  /**
   * Updates whether the form is valid.
   *
   * Saves on computation by only updating if the store has subscribers.
   *
   * @param force Whether to force the validation and the store to update and notify subscribers.
   */
  async updateValid(force?: boolean): Promise<void> {
    if (!force && !this.state.isValid.hasSubscribers) {
      return
    }

    const result = await this.validate()

    this.state.isValid.set(result.isValid)
  }

  /**
   * Trigger a field.
   */
  trigger: Trigger<TValues> = async (name, options) => {
    this.state.isValidating.set(true)

    this.updateValid()

    const result = await this.validate(name as any)

    if (result.validationResult) {
      this.mergeErrors(result.validationResult.errors, result.validationResult.names)
    }

    if (result.resolverResult?.errors) {
      this.mergeErrors(result.resolverResult.errors)
    }

    this.state.isValid.set(result.isValid)

    this.state.isValidating.set(false)

    if (options?.shouldFocus && !result.isValid) {
      const fieldNames = (name == null || Array.isArray(name) ? name : [name]) as
        | string[]
        | undefined
      const callback = (key?: string) => key && safeGet(this.state.errors.value, key)
      focusFieldBy(this.fields, callback, name ? fieldNames : this.names.mount)
    }
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
   */
  register: Register<TValues> = (name, options = {}) => {
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

    const unregisterElement = () => this.unregisterElement(name, options)

    this.unmountActions.push(unregisterElement)

    const props: RegisterResult = {
      registerElement: (element) => this.registerElement(name, element, options),
      unregisterElement,
    }

    if (existingField) {
      this.updateDisabledField({ field, disabled: options.disabled, name })
      return props
    }

    const defaultValue =
      safeGet(this.state.values.value, name) ??
      options.value ??
      safeGet(this.state.defaultValues.value, name)

    this.state.values.update((values) => {
      deepSet(values, name, defaultValue)
      return values
    })

    this.updateValid()

    return props
  }

  /**
   */
  unregister: Unregister<TValues> = (name, options = {}) => {
    const nameArray = (Array.isArray(name) ? name : name ? [name] : this.names.mount) as string[]

    for (const fieldName of nameArray) {
      this.names.mount.delete(fieldName)
      this.names.array.delete(fieldName)

      if (!options.keepValue) {
        deepUnset(this.fields, fieldName)

        this.state.values.update((values) => {
          deepUnset(values, fieldName)
          return values
        })
      }

      if (!options.keepError) {
        this.state.errors.update((errors) => {
          deepUnset(errors, fieldName)
          return errors
        })
      }

      if (!options.keepDirty) {
        this.state.dirtyFields.update((dirtyFields) => {
          deepUnset(dirtyFields, fieldName)
          return dirtyFields
        })

        this.state.isDirty.set(this.getDirty())
      }

      if (!options.keepTouched) {
        this.state.touchedFields.update((touchedFields) => {
          deepUnset(touchedFields, fieldName)
          return touchedFields
        })
      }

      if (!this.options.shouldUnregister && !options.keepDefaultValue) {
        this.state.defaultValues.update((defaultValues) => {
          deepUnset(defaultValues, fieldName)
          return defaultValues
        })
      }
    }

    if (!options.keepIsValid) {
      this.updateValid()
    }
  }

  /**
   * Register an HTML input element.
   */
  registerElement: RegisterElement<TValues> = (name, element, options = {}) => {
    this.register(name, options)

    const field: Field | undefined = safeGet(this.fields, name)

    const newField = mergeElementWithField(name, field, element)

    deepSet(this.fields, name, newField)

    const defaultValue =
      safeGet(this.state.values.value, name) ?? safeGet(this.state.defaultValues.value, name)

    if (defaultValue == null || (newField._f.ref as HTMLInputElement)?.defaultChecked) {
      this.state.values.update((values) => {
        deepSet(values, name, getFieldValue(newField._f))
        return values
      })
    } else {
      this.setFieldValue(name, defaultValue)
    }

    element.name = name

    // TODO: what are the equivalent DOM events for React's "onChange" prop?
    element.addEventListener('change', this.handleChange.bind(this))
    element.addEventListener('blur', this.handleChange.bind(this))
    element.addEventListener('focusout', this.handleChange.bind(this))

    if (element.type !== 'radio' && element.type !== 'checkbox') {
      element.addEventListener('input', this.handleChange.bind(this))
    }

    this.updateValid()
  }

  /**
   * Unregister a field.
   */
  unregisterElement: UnregisterElement<TValues> = (name, options = {}) => {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f) {
      field._f.mount = false
    }

    const shouldUnregister = this.options.shouldUnregister || options.shouldUnregister

    if (shouldUnregister && !this.names.array.has(name)) {
      this.names.unMount.add(name)
    }
  }

  /**
   * Sets one field value.
   */
  setValue: SetValue<TValues> = (name, value, options = {}) => {
    const field: Field | undefined = safeGet(this.fields, name)

    const clonedValue = structuredClone(value)

    this.state.values.update((values) => {
      deepSet(values, name, clonedValue)
      return values
    })

    const isFieldArray = this.names.array.has(name)

    if (!isFieldArray) {
      if (field && !field._f && clonedValue != null) {
        this.setValues(name, clonedValue, options)
      } else {
        this.setFieldValue(name, clonedValue, options)
      }

      return
    }

    const hasSubscribers =
      this.state.isDirty.hasSubscribers || this.state.dirtyFields.hasSubscribers

    if (hasSubscribers && options.shouldDirty) {
      this.state.dirtyFields.set(
        getDirtyFields(this.state.defaultValues.value, this.state.values.value),
      )
      this.state.isDirty.set(this.getDirty())
    }
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
  setValues(name: string, value: any, options?: SetValueOptions) {
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
  }

  /**
   * Sets a field's value.
   */
  setFieldValue(name: string, value: unknown, options: SetValueOptions = {}) {
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
      this.state.values.update((values) => {
        deepSet(values, name, getFieldValueAs(value, fieldReference))
        return values
      })
    }

    this.touch(name, fieldValue, options)

    if (options.shouldValidate) {
      this.trigger(name as any)
    }
  }

  /**
   */
  async handleChange(event: Event): Promise<void | boolean> {
    const target: any = event.target

    const name = target.name

    const field: Field | undefined = safeGet(this.fields, name)

    if (field == null) {
      return
    }

    const fieldValue = getCurrentFieldValue(event, field)

    this.state.values.update((values) => {
      deepSet(values, name, fieldValue)
      return values
    })

    const isBlurEvent = event.type === INPUT_EVENTS.BLUR || event.type === INPUT_EVENTS.FOCUS_OUT

    if (isBlurEvent) {
      field._f.onBlur?.(event)
    } else {
      field._f.onChange?.(event)
    }

    if (!isBlurEvent) {
      this.updateDirtyField(name, fieldValue)
    } else {
      this.updateTouchedField(name)
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
      return
    }

    this.state.isValidating.set(true)

    const result = await this.validate(name)

    this.state.isValid.set(result.isValid)

    if (result.resolverResult) {
      const previousError = lookupError(this.state.errors.value, this.fields, name)

      const currentError = lookupError(
        result.resolverResult.errors ?? {},
        this.fields,
        previousError.name || name,
      )

      this.state.errors.update((errors) => {
        if (currentError.error) {
          deepSet(errors, currentError.name, currentError.error)
        } else {
          deepUnset(errors, currentError.name)
        }
        return errors
      })

      if (field._f.deps) {
        this.trigger(field._f.deps as any)
      }
    }

    if (result.validationResult) {
      const isFieldValueUpdated =
        Number.isNaN(fieldValue) ||
        (fieldValue === safeGet(this.state.values.value, name) ?? fieldValue)

      const error = result.validationResult.errors[name]

      if (isFieldValueUpdated && !error && this.state.isValid.hasSubscribers) {
        const fullResult = await this.validate()

        if (fullResult.validationResult?.errors) {
          this.mergeErrors(fullResult.validationResult.errors, fullResult.validationResult.names)
        }
      } else {
        this.state.errors.update((errors) => {
          deepSet(errors, name, error)
          return errors
        })
      }

      if (isFieldValueUpdated && field._f.deps) {
        this.trigger(field._f.deps as any)
      }
    }

    this.state.isValidating.set(false)
  }

  /**
   */
  handleSubmit: HandleSubmit<TValues> = (onValid, onInvalid) => {
    return async (event?: Event) => {
      event?.preventDefault?.()

      this.state.isSubmitting.set(true)

      const { isValid, resolverResult, validationResult } = await this.validate()

      const errors = resolverResult?.errors ?? validationResult?.errors ?? {}

      deepUnset(this.state.errors.value, 'root')

      this.mergeErrors(errors)

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
    }
  }

  /**
   */
  reset: Reset<TValues> = (formValues, options = {}) => {
    const updatedValues = formValues ? structuredClone(formValues) : this.state.defaultValues.value

    const cloneUpdatedValues = structuredClone(updatedValues)

    const values =
      formValues && isEmptyObject(formValues) ? this.state.defaultValues.value : cloneUpdatedValues

    if (!options.keepDefaultValues) {
      this.state.defaultValues.set(updatedValues as DeepPartial<TValues>)
    }

    if (!options.keepValues) {
      if (options.keepDirtyValues || this.options.shouldCaptureDirtyFields) {
        for (const fieldName of this.names.mount) {
          if (safeGet(this.state.dirtyFields.value, fieldName)) {
            deepSet(values, fieldName, safeGet(this.state.values.value, fieldName))
          } else {
            this.setValue(fieldName as any, safeGet(values, fieldName))
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
        ? options.keepDefaultValues
          ? structuredClone(this.state.defaultValues.value)
          : {}
        : structuredClone(values)

      this.state.values.set(newValues as TValues)
    }

    this.names = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
      watch: new Set(),
    }

    if (!options.keepSubmitCount) {
      this.state.submitCount.set(0)
    }

    if (!options.keepDirty) {
      this.state.isDirty.set(
        Boolean(
          options.keepDefaultValues && !deepEqual(formValues, this.state.defaultValues.value),
        ),
      )
    }

    if (!options.keepDirtyValues) {
      if (options.keepDefaultValues && formValues) {
        this.state.dirtyFields.set(getDirtyFields(this.state.defaultValues.value, formValues))
      } else {
        this.state.dirtyFields.set({})
      }
    }

    if (!options.keepTouched) {
      this.state.touchedFields.set({})
    }

    if (!options.keepErrors) {
      this.state.errors.set({})
    }

    if (!options.keepIsSubmitSuccessful) {
      this.state.isSubmitSuccessful.set(false)
    }

    this.state.isSubmitting.set(false)
  }

  /**
   * @param resetValues Whether to reset the form's values too.
   */
  async resetDefaultValues(resolvingDefaultValues: Defaults<TValues>, resetValues?: boolean) {
    if (resolvingDefaultValues == null) {
      // Ensure that the form is not loading.
      if (this.state.isLoading.value) {
        this.state.isLoading.set(false)
      }
      return
    }

    // If the form wasn't loading, it should be now since it's waiting for the default values to resolve.
    if (!this.state.isLoading.value && resolvingDefaultValues instanceof Promise) {
      this.state.isLoading.set(true)
    }

    const resolvedDefaultValues = await resolvingDefaultValues

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

  /**
   * Merges errors into the form state's errors.
   *
   * Errors from a resolver or native validator can be generated without updating the form state.
   * This method merges those errors into form state's errors store and notifies subscribers.
   *
   * The names array is helpful for capturing names of fields with removed errors.
   *
   * @param errors The errors into the form state's errors.
   * @param names The names of the affected fields.
   */
  mergeErrors(errors: FieldErrors<TValues> | FieldErrorRecord, names?: string[]): void {
    const namesToMerge = names ?? Object.keys(errors)

    this.state.errors.update((currentErrors) => {
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

      return newErrors
    })
  }

  /**
   * Touches a field.
   */
  touch(name: string, value?: unknown, options?: SetValueOptions) {
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
    const nameArray = (name == null || Array.isArray(name) ? name : [name]) as string[] | undefined

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate(nameArray)

      const isValid = validationResult.valid

      return { validationResult, isValid }
    } else {
      const names = nameArray ?? Array.from(this.names.mount)

      const fields = deepFilter(this.fields, names)

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
}
