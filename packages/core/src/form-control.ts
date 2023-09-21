import {
  VALIDATION_MODE,
  type RevalidationMode,
  type ValidationMode,
  type CriteriaMode,
  type Stage,
  STAGE,
} from './constants'
import { getFieldValue } from './logic/fields/get-field-value'
import { isCheckBoxInput } from './logic/html/checkbox'
import { isHTMLElement } from './logic/html/is-html-element'
import { isRadioInput } from './logic/html/radio'
import { getResolverOptions } from './logic/resolver/get-resolver-options'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { Writable } from './store'
import type { FieldErrors } from './types/errors'
import type { Field, FieldElement, FieldRecord, FieldReference } from './types/fields'
import type { RegisterOptions } from './types/register'
import type { Resolver } from './types/resolver'
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
  register<T extends TParsedForm['keys']>(name: T, options: RegisterOptions<TValues, T> = {}) {
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

    const props = {
      registerElement: (this.registerElement<T>).bind(this, name, options),
      unregisterElement: (this.unregisterElement<T>).bind(this, name, options),
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
    options: RegisterOptions<TValues, T> = {},
    element: HTMLInputElement,
  ): void {
    this.register(name, options)

    const field: Field | undefined = safeGet(this.fields, name)

    const ref =
      element.value == null
        ? element.querySelectorAll
          ? (element.querySelectorAll('input,select,textarea')[0] as FieldElement) || element
          : element
        : element

    const radioOrCheckbox = isRadioInput(ref) || isCheckBoxInput(ref)

    const refs = field?._f.refs ?? []

    if (radioOrCheckbox ? refs.find((option) => option === ref) : ref === field?._f.ref) {
      return
    }

    /**
     * An extra object was appended to the refs array for some reason?
     * ...(Array.isArray(safeGet(this.state.defaultValues.value, name)) ? [{}] : []),
     */
    const a: FieldReference = radioOrCheckbox
      ? {
          name,
          ref,
          refs: [...refs.filter((ref) => isHTMLElement(ref) && ref.isConnected), ref],
        }
      : {
          name,
          ref,
        }

    const newField: Field = {
      _f: {
        ...field?._f,
        ...a,
      },
    }

    deepSet(this.fields, name, newField)

    const defaultValue =
      safeGet(this.state.values.value, name) ?? safeGet(this.state.defaultValues.value, name)

    if (defaultValue == null || (ref as HTMLInputElement)?.defaultChecked) {
      this.state.values.update((values) => {
        deepSet(values, name, getFieldValue(newField._f))
        return values
      })
    } else {
      // setFieldValue(name, defaultValue);
    }

    this.updateValid()
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
   * Either natively validates the form or runs the form's resolver to validate the form.
   */
  async updateValid() {
    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate()

      const isValid = validationResult.valid

      this.state.isValid.set(isValid)

      return
    }

    // Pass the form values through the provided resolver.

    const resolverOptions = getResolverOptions(
      this.names.mount,
      this.fields,
      this.options.criteriaMode,
      this.options.shouldUseNativeValidation,
    )

    const resolverResult = await this.options.resolver(
      this.state.values.value,
      this.options.context,
      resolverOptions,
    )

    this.mergeErrors(resolverResult.errors)

    const isValid = resolverResult.errors == null || isEmptyObject(resolverResult.errors)

    this.state.isValid.set(isValid)
  }

  /**
   * Updates the specified field name to be touched.
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
   * @returns Whether the field's dirty status changed.
   */
  updateDirtyField(name: string, value?: unknown): boolean {
    const defaultValue = safeGet(this.state.defaultValues.value, name)

    // The field will be dirty if its value is different from its default value.
    const currentIsDirty = !deepEqual(defaultValue, value)

    const previousIsDirty = Boolean(safeGet(this.state.dirtyFields.value, name))

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
}
