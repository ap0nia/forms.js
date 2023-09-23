import {
  VALIDATION_MODE,
  type RevalidationMode,
  type ValidationMode,
  type CriteriaMode,
  type Stage,
  STAGE,
  EVENTS,
  type SubmissionValidationMode,
  getValidationModes,
} from './constants'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getFieldValue, getFieldValueAs } from './logic/fields/get-field-value'
import { hasValidation } from './logic/fields/has-validation'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { isHTMLElement } from './logic/html/is-html-element'
import { mergeElementWithField } from './logic/html/merge-element-with-field'
import { getResolverOptions } from './logic/resolver/get-resolver-options'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { shouldSkipValidationAfter } from './logic/validation/should-skip-validation-after'
import { Writable } from './store'
import type { FieldErrors } from './types/errors'
import type { AnyEvent } from './types/event'
import type { Field, FieldRecord } from './types/fields'
import type { RegisterOptions, RegisterResult } from './types/register'
import type { Resolver, ResolverResult } from './types/resolver'
import { cloneObject } from './utils/clone-object'
import { deepEqual } from './utils/deep-equal'
import { deepFilter } from './utils/deep-filter'
import { deepSet } from './utils/deep-set'
import { deepUnset } from './utils/deep-unset'
import { isEmptyObject, isObject } from './utils/is-object'
import type { Nullish } from './utils/null'
import { safeGet, safeGetMultiple } from './utils/safe-get'
import type { DeepMap } from './utils/types/deep-map'
import type { DeepPartial } from './utils/types/deep-partial'
import type { FlattenObject } from './utils/types/flatten-object'
import type { KeysToProperties } from './utils/types/keys-to-properties'

const defaultOptions: FormControlOptions<any> = {
  mode: VALIDATION_MODE.onSubmit,
  revalidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
}

export type TriggerOptions = {
  shouldFocus?: boolean
}

export type TriggerResult<T> =
  | { resolverResult: ResolverResult<T>; validationResult?: never; isValid: boolean }
  | { resolverResult?: never; validationResult: NativeValidationResult; isValid: boolean }

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
   * Default values for form fields.
   */
  defaultValues?:
    | DeepPartial<TValues>
    | (() => DeepPartial<TValues> | Promise<DeepPartial<TValues>>)

  /**
   * Set the form values directly.
   */
  values?: TValues

  /**
   * How to treat the form state when resetting it.
   */
  resetOptions?: KeepStateOptions

  /**
   * Processes the form values.
   */
  resolver?: Resolver<TValues, TContext>

  /**
   * TODO: Placeholder.
   */
  context?: TContext

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
   * Mostly an internal option. Whether to continue validating after the first error is found.
   */
  shouldDisplayAllAssociatedErrors?: boolean
}

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

/**
 * Overall form state.
 */
export type FormState<T> = {
  /**
   * Whether any of the fields have been modified.
   */
  isDirty: boolean

  /**
   * Whether the form is currently loading its default values?
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
   * The default values?
   */
  defaultValues: DeepPartial<T>

  /**
   * The current form values.
   */
  values: T

  /**
   * A record of field names mapped to their errors.
   */
  errors: FieldErrors<T>
}

/**
 * A form's values are structured as an object.
 *
 * In order to deeply reference a value, a dot-concatenated string path is used.
 *
 * This is also translated to type definitions.
 */
export type ParsedForm<T = Record<string, any>> = {
  /**
   * The flattened form values.
   */
  flattened: FlattenObject<T>

  /**
   * Keys to access the flattened form values.
   */
  keys: Extract<keyof FlattenObject<T>, string>
}

/**
 * Options when disabling a field.
 */
export type UpdateDisabledFieldOptions = {
  /**
   */
  disabled?: boolean

  /**
   */
  name: string

  /**
   */
  field?: Field

  /**
   */
  fields?: FieldRecord
}

/**
 * Options when setting a value.
 */
export type SetValueOptions = {
  /**
   */
  shouldValidate?: boolean

  /**
   */
  shouldDirty?: boolean

  /**
   */
  shouldTouch?: boolean
}

/**
 * The core functionality of the library is encompassed by a form control that controls field/form behavior.
 */
export class FormControl<
  TValues extends Record<string, any>,
  TContext = any,
  TParsedForm extends ParsedForm<TValues> = ParsedForm<TValues>,
> {
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
  state: { [Key in keyof FormState<TValues>]: Writable<FormState<TValues>[Key]> }

  /**
   * The current stage of the form. Certain operations are performed during certain stages.
   *
   * @public
   */
  stage: Stage[keyof Stage]

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

  submissionValidationMode: SubmissionValidationMode

  constructor(options?: FormControlOptions<TValues, TContext>) {
    const resolvedOptions = { ...defaultOptions, ...options }

    resolvedOptions.shouldDisplayAllAssociatedErrors ??=
      resolvedOptions.criteriaMode === VALIDATION_MODE.all

    const defaultValues =
      isObject(resolvedOptions.defaultValues) || isObject(resolvedOptions.values)
        ? cloneObject(resolvedOptions.defaultValues || resolvedOptions.values)
        : {}

    this.options = resolvedOptions

    this.state = {
      submitCount: new Writable(0),
      isDirty: new Writable(false),
      isLoading: new Writable(typeof resolvedOptions.defaultValues === 'function'),
      isValidating: new Writable(false),
      isSubmitted: new Writable(false),
      isSubmitting: new Writable(false),
      isSubmitSuccessful: new Writable(false),
      isValid: new Writable(false),
      touchedFields: new Writable({}),
      dirtyFields: new Writable({}),
      defaultValues: new Writable(defaultValues),
      values: new Writable(resolvedOptions.shouldUnregister ? {} : cloneObject(defaultValues)),
      errors: new Writable({}),
    }

    this.stage = STAGE.IDLE

    this.submissionValidationMode = {
      beforeSubmission: getValidationModes(resolvedOptions.mode),
      afterSubmission: getValidationModes(resolvedOptions.revalidateMode),
    }
  }

  getValues(): TValues

  getValues<T extends TParsedForm['keys']>(fieldName: T): TParsedForm['flattened'][T]

  getValues<T extends TParsedForm['keys'][]>(
    names: readonly [...T],
  ): KeysToProperties<TParsedForm['flattened'], T>

  getValues<T extends TParsedForm['keys'][]>(
    ...names: readonly [...T]
  ): KeysToProperties<TParsedForm['flattened'], T>

  getValues(...fieldNames: any[]): any {
    const names = fieldNames.length > 1 ? fieldNames : fieldNames[0]
    return safeGetMultiple(this.state.values.value, names)
  }

  /**
   * Register a new field
   */
  register<T extends TParsedForm['keys']>(
    name: T,
    options: RegisterOptions<TValues, T> = {},
  ): RegisterResult {
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

    const props: RegisterResult = {
      registerElement: (element) => this.registerElement(name, element, options),
      unregisterElement: () => this.unregisterElement(name, options),
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
   * Given a dot-concatenated string path, return whether the error for the field exists.
   */
  errorExists(key?: string): boolean {
    return Boolean(key && safeGet(this.state.errors.value, key))
  }

  /**
   * Either natively validates the form or runs the form's resolver to validate the form.
   */
  async updateValid(
    name?: TParsedForm['keys'] | TParsedForm['keys'][] | readonly TParsedForm['keys'][],
    options?: TriggerOptions,
  ) {
    const nameArray = (name == null || Array.isArray(name) ? name : [name]) as string[] | undefined

    const allFieldNames = nameArray ?? this.names.mount

    if (this.options.resolver == null) {
      this.state.isValidating.set(true)

      const validationResult = await this.nativeValidate(nameArray)

      this.state.isValidating.set(false)

      const isValid = validationResult.valid

      this.state.isValid.set(isValid)

      if (options?.shouldFocus && !isValid) {
        focusFieldBy(this.fields, this.errorExists.bind(this), allFieldNames)
      }

      return { validationResult, isValid }
    }

    // Pass the form values through the provided resolver.

    const resolverOptions = getResolverOptions(
      this.names.mount,
      this.fields,
      this.options.criteriaMode,
      this.options.shouldUseNativeValidation,
    )

    this.state.isValidating.set(true)

    const resolverResult = await this.options.resolver(
      this.state.values.value,
      this.options.context,
      resolverOptions,
    )

    this.mergeErrors(resolverResult.errors)

    const isValid = resolverResult.errors == null || isEmptyObject(resolverResult.errors)

    if (options?.shouldFocus && !isValid) {
      focusFieldBy(this.fields, this.errorExists.bind(this), allFieldNames)
    }

    this.state.isValid.set(isValid)

    return { resolverResult, isValid }
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
   * Merges a new errors object into the form state's errors.
   * A resolver can generate an errors object after validating the form values.
   *
   * @internal
   */
  mergeErrors(errors?: FieldErrors<TValues>, names?: string[]): void {
    const namesToMerge = names ?? Object.keys(errors ?? {})

    this.state.errors.update((currentErrors) => {
      // If there are names, then mutate the current errors.
      // Otherwise, create a new errors object.
      const newErrors = names?.length ? currentErrors : {}

      for (const name of namesToMerge) {
        const error = safeGet(errors, name)

        if (error) {
          deepSet(newErrors, name, error)
        } else {
          deepUnset(newErrors, name)
        }
      }

      return newErrors
    })
  }

  /**
   * Validate a field using native HTML input constraints.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation#validation-related_attributes
   *
   * @param names Names of fields to filter. If not null, only specified fields will be validated.
   * @param shouldOnlyCheckValid Whether to stop checking the remaining fields after the first error is found.
   */
  async nativeValidate(
    names?: string | string[] | Nullish,
    shouldOnlyCheckValid?: boolean,
  ): Promise<NativeValidationResult> {
    const fields = deepFilter<FieldRecord>(this.fields, names)

    const validationResult = await nativeValidateFields(fields, this.state.values.value, {
      shouldOnlyCheckValid,
      shouldUseNativeValidation: this.options.shouldUseNativeValidation,
      shouldDisplayAllAssociatedErrors: this.options.shouldDisplayAllAssociatedErrors,
      isFieldArrayRoot: (name) => this.names.array.has(name),
    })

    this.state.errors.update((errors) => {
      validationResult.names.forEach((name) => {
        const fieldError = safeGet(validationResult.errors, name)

        // After validation, an affected field name has no errors.
        if (fieldError == null) {
          deepUnset(errors, name)
          return
        }

        // After validation, a regular field name has errors.
        if (!this.names.array.has(name)) {
          deepSet(errors, name, safeGet(validationResult.errors, name))
          return
        }

        // After validation, a field array root name has errors.
        const fieldArrayErrors = safeGet(errors, name) ?? {}

        deepSet(fieldArrayErrors, 'root', validationResult.errors[name])

        deepSet(errors, name, fieldArrayErrors)
      })

      return errors
    })

    return validationResult
  }

  /**
   * Sets a field's value.
   */
  setFieldValue(name: string, value: any, options: SetValueOptions = {}) {
    const field: Field | undefined = safeGet(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    // If the field exists and isn't disabled, then also update the form values.
    if (!fieldReference.disabled) {
      this.state.values.update((values) => {
        deepSet(values, name, getFieldValueAs(value, fieldReference))
        return values
      })
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    updateFieldReference(fieldReference, fieldValue)

    this.touch(name, fieldValue, options)
  }

  async touch(name: string, value?: unknown, options?: SetValueOptions) {
    if (!options?.shouldTouch || options.shouldDirty) {
      this.updateDirtyField(name, value)
    }

    if (options?.shouldTouch) {
      this.updateTouchedField(name)
    }

    if (options?.shouldValidate) {
      await this.updateValid(name as TParsedForm['keys'])
    }
  }

  unregisterElement<T extends TParsedForm['keys']>(
    name: T,
    options: RegisterOptions<TValues, T> = {},
  ): void {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f) {
      field._f.mount = false
    }

    const shouldUnregister = this.options.shouldUnregister || options.shouldUnregister

    if (shouldUnregister && !this.names.array.has(name)) {
      this.names.unMount.add(name)
    }
  }

  registerElement<T extends TParsedForm['keys']>(
    name: T,
    element: HTMLInputElement,
    options: RegisterOptions<TValues, T> = {},
  ): void {
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

    this.updateValid()
  }

  async handleChange(event: AnyEvent): Promise<void | boolean> {
    const target = event.target

    const name = target.name

    const field: Field | undefined = safeGet(this.fields, name)

    if (field == null) {
      return
    }

    // const fieldValue = getCurrentFieldValue(event, field)

    const isBlurEvent = event.type === EVENTS.BLUR || event.type === EVENTS.FOCUS_OUT

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
        this.submissionValidationMode,
      )

    console.log({ shouldSkipValidation })

    // const watched = isWatched(name, _names, isBlurEvent)

    // this.state.values.update((values) => {
    //   deepSet(values, name, fieldValue)
    //   return values
    // })

    // if (isBlurEvent) {
    //   field._f.onBlur && field._f.onBlur(event)
    //   delayErrorCallback && delayErrorCallback(0)
    // } else if (field._f.onChange) {
    //   field._f.onChange(event)
    // }

    // const fieldState = updateTouchAndDirty(name, fieldValue, isBlurEvent, false)

    // const shouldRender = !isEmptyObject(fieldState) || watched

    // !isBlurEvent &&
    //   _subjects.values.next({
    //     name,
    //     type: event.type,
    //     values: { ..._formValues },
    //   })

    // if (shouldSkipValidation) {
    //   _proxyFormState.isValid && _updateValid()

    //   return shouldRender && _subjects.state.next({ name, ...(watched ? {} : fieldState) })
    // }

    // !isBlurEvent && watched && _subjects.state.next({ ..._formState })

    // _updateIsValidating(true)

    // if (_options.resolver) {
    //   const { errors } = await _executeSchema([name])
    //   const previousErrorLookupResult = schemaErrorLookup(_formState.errors, _fields, name)
    //   const errorLookupResult = schemaErrorLookup(
    //     errors,
    //     _fields,
    //     previousErrorLookupResult.name || name,
    //   )

    //   error = errorLookupResult.error
    //   name = errorLookupResult.name

    //   isValid = isEmptyObject(errors)
    // } else {
    //   error = (
    //     await validateField(
    //       field,
    //       _formValues,
    //       shouldDisplayAllAssociatedErrors,
    //       _options.shouldUseNativeValidation,
    //     )
    //   )[name]

    //   isFieldValueUpdated =
    //     Number.isNaN(fieldValue) || fieldValue === get(_formValues, name, fieldValue)

    //   if (isFieldValueUpdated) {
    //     if (error) {
    //       isValid = false
    //     } else if (_proxyFormState.isValid) {
    //       isValid = await executeBuiltInValidation(_fields, true)
    //     }
    //   }
    // }

    // if (isFieldValueUpdated) {
    //   field._f.deps && trigger(field._f.deps as FieldPath<TFieldValues> | FieldPath<TFieldValues>[])
    //   shouldRenderByError(name, isValid, error, fieldState)
    // }
  }
}
