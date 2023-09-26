import {
  VALIDATION_MODE,
  type CriteriaMode,
  type RevalidationMode,
  type SubmissionValidationMode,
  type ValidationMode,
} from './constants'
import { getFieldValueAs } from './logic/fields/get-field-value'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { isHTMLElement } from './logic/html/is-html-element'
import { getResolverOptions } from './logic/resolver/get-resolver-options'
import { getValidationModes } from './logic/validation/get-validation-modes'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { Writable } from './store'
import type { FieldErrors, InternalFieldErrors } from './types/errors'
import type { Field, FieldRecord } from './types/fields'
import type { RegisterOptions, RegisterResult } from './types/register'
import type { Resolver } from './types/resolver'
import { deepEqual } from './utils/deep-equal'
import { deepFilter } from './utils/deep-filter'
import { deepSet } from './utils/deep-set'
import { deepUnset } from './utils/deep-unset'
import { isEmptyObject, isObject } from './utils/is-object'
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

type FormControlOptions<TValues extends Record<string, any>, TContext = any> = {
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
type KeepStateOptions = {
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
type FormState<T> = {
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

  /**
   * The state of the form component.
   */
  component: ComponentState
}

/**
 * The state of the form component.
 */
export type ComponentState = {
  /**
   * Whether the form has been mounted.
   */
  mounted: boolean
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
        ? structuredClone(resolvedOptions.defaultValues || resolvedOptions.values)
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
      values: new Writable(resolvedOptions.shouldUnregister ? {} : structuredClone(defaultValues)),
      errors: new Writable({}),
      component: new Writable({ mounted: false } as ComponentState),
    }

    this.submissionValidationMode = {
      beforeSubmission: getValidationModes(resolvedOptions.mode),
      afterSubmission: getValidationModes(resolvedOptions.revalidateMode),
    }
  }

  /**
   * Gets all the values.
   */
  getValues(): TValues

  /**
   * Gets a single value.
   */
  getValues<T extends TParsedForm['keys']>(fieldName: T): TParsedForm['flattened'][T]

  /**
   * Get an array of values.
   */
  getValues<T extends TParsedForm['keys'][]>(
    names: readonly [...T],
  ): KeysToProperties<TParsedForm['flattened'], T>

  /**
   * Get an array of values.
   */
  getValues<T extends TParsedForm['keys'][]>(
    ...names: readonly [...T]
  ): KeysToProperties<TParsedForm['flattened'], T>

  /**
   * Implementation.
   *
   * The loose typing has lower priority than the overloads, so it's not observed publicly.
   *
   * @internal
   */
  getValues(...fieldNames: any[]): any {
    const names = fieldNames.length > 1 ? fieldNames : fieldNames[0]
    return safeGetMultiple(this.state.values.value, names)
  }

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
      // registerElement: (element) => this.registerElement(name, element, options),
      // unregisterElement: () => this.unregisterElement(name, options),
    } as any

    if (existingField) {
      // this.updateDisabledField({ field, disabled: options.disabled, name })
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

    // TODO: not sure what's the best way to preserve this semantic.
    // if (this.state.component.value.mounted) {
    //   this.updateValid()
    // }

    this.updateValid()

    return props
    //   ...(typeof options.diabled === 'boolean' && { disabled: options.disabled }),
    //   ...(_options.progressive
    //     ? {
    //         required: !!options.required,
    //         min: getRuleValue(options.min),
    //         max: getRuleValue(options.max),
    //         minLength: getRuleValue<number>(options.minLength) as number,
    //         maxLength: getRuleValue(options.maxLength) as number,
    //         pattern: getRuleValue(options.pattern) as string,
    //       }
    //     : {}),
    //   name,
    //   onChange,
    //   onBlur: onChange,
    //   ref: (ref: HTMLInputElement | null): void => {
    //     if (ref) {
    //       register(name, options)
    //       field = get(_fields, name)
    //       const fieldRef = isUndefined(ref.value)
    //         ? ref.querySelectorAll
    //           ? (ref.querySelectorAll('input,select,textarea')[0] as Ref) || ref
    //           : ref
    //         : ref
    //       const radioOrCheckbox = isRadioOrCheckbox(fieldRef)
    //       const refs = field._f.refs || []
    //       if (
    //         radioOrCheckbox
    //           ? refs.find((option: Ref) => option === fieldRef)
    //           : fieldRef === field._f.ref
    //       ) {
    //         return
    //       }
    //       set(_fields, name, {
    //         _f: {
    //           ...field._f,
    //           ...(radioOrCheckbox
    //             ? {
    //                 refs: [
    //                   ...refs.filter(live),
    //                   fieldRef,
    //                   ...(Array.isArray(get(_defaultValues, name)) ? [{}] : []),
    //                 ],
    //                 ref: { type: fieldRef.type, name },
    //               }
    //             : { ref: fieldRef }),
    //         },
    //       })
    //       updateValidAndValue(name, false, undefined, fieldRef)
    //     } else {
    //       field = get(_fields, name, {})
    //       if (field._f) {
    //         field._f.mount = false
    //       }
    //       ;(_options.shouldUnregister || options.shouldUnregister) &&
    //         !(isNameInFieldArray(_names.array, name) && _state.action) &&
    //         _names.unMount.add(name)
    //     }
    //   },
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
   * Validate the form using either a provided resolver or native validation.
   *
   * @param name The name or names of the fields to validate. If not provided, all fields will be validated.
   *
   * TODO: return type.
   *
   * @returns Whether the form is valid and the resolver or native validation result.
   */
  async validate(name?: string | string[]) {
    const nameArray = (name == null || Array.isArray(name) ? name : [name]) as string[] | undefined

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate(nameArray)

      const isValid = validationResult.valid

      return { validationResult, isValid }
    } else {
      const resolverOptions = getResolverOptions(
        nameArray ?? this.names.mount,
        this.fields,
        this.options.criteriaMode,
        this.options.shouldUseNativeValidation,
      )

      const resolverResult = await this.options.resolver(
        this.state.values.value,
        this.options.context,
        resolverOptions,
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
  mergeErrors(errors: FieldErrors<TValues> | InternalFieldErrors, names?: string[]): void {
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
}
