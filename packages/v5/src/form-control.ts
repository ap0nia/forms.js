import {
  VALIDATION_MODE,
  type CriteriaMode,
  type RevalidationMode,
  type ValidationMode,
  type State,
} from './constants'
import type { FieldErrors } from './logic/errors'
import type { Field, FieldElement, FieldRecord } from './logic/fields'
import { focusFieldBy } from './logic/helpers/focus-field-by'
import { getFieldValue, getFieldValueAs } from './logic/helpers/get-field-value'
import { getResolverOptions } from './logic/helpers/get-resolver-options'
import { getRuleValue } from './logic/helpers/get-rule-value'
import { updateFieldReference } from './logic/helpers/update-field-reference'
import { isCheckBoxInput } from './logic/html/checkbox'
import { isHTMLElement } from './logic/html/is-html-element'
import { isRadioInput } from './logic/html/radio'
import { nativeValidateFields } from './logic/native-validation'
import type { NativeValidationResult } from './logic/native-validation/types'
import type { RegisterOptions } from './logic/register'
import type { Resolver, ResolverResult } from './logic/resolver'
import { Writable } from './store'
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
import type { MaybePromise } from './utils/types/maybe-promise'

const defaultOptions: FormControlOptions<any> = {
  mode: VALIDATION_MODE.onSubmit,
  revalidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
}

export type FormControlOptions<TValues extends Record<string, any>, TContext = any> = {
  /**
   * When to validate the form.
   */
  mode?: keyof ValidationMode

  /**
   * When to revalidate the form.
   */
  revalidateMode?: keyof RevalidationMode

  /**
   * Default values for form fields.
   */
  defaultValues?: DeepPartial<TValues> | (() => MaybePromise<DeepPartial<TValues>>)

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
  criteriaMode?: CriteriaMode

  /**
   * Debounce setting?
   */
  delayError?: number
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
 * Options when setting a value.
 */
export type SetValueOptions = {
  shouldValidate?: boolean
  shouldDirty?: boolean
  shouldTouch?: boolean
}

export type TriggerOptions = {
  shouldFocus?: boolean
}

export type TriggerResult<T> =
  | { resolverResult: ResolverResult<T>; validationResult?: never; isValid: boolean }
  | { resolverResult?: never; validationResult: NativeValidationResult; isValid: boolean }

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
   * The default values? Why is this duplicated?
   */
  defaultValues?: undefined | Readonly<DeepPartial<T>>

  /**
   * Fields that have been modified.
   */
  dirtyFields: Partial<Readonly<DeepMap<T, boolean>>>

  /**
   * Fields that have been touched.
   */
  touchedFields: Partial<Readonly<DeepMap<T, boolean>>>

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
 * The core functionality of the library is encompassed by a form control that controls field/form behavior.
 */
export class FormControl<
  TValues extends Record<string, any>,
  TContext = any,
  TParsedForm extends ParsedForm<TValues> = ParsedForm<TValues>,
> {
  options: FormControlOptions<TValues, TContext>

  fields: FieldRecord = {}

  /**
   * Names of fields doing something.
   */
  names = {
    mount: new Set<string>(),
    unMount: new Set<string>(),
    array: new Set<string>(),
    watch: new Set<string>(),
  }

  stores = {
    values: new Writable<{ name: string; values: TValues }>(),
    state: new Writable<Partial<FormState<TValues>> & { name?: string }>(),
  }

  defaultValues: DeepPartial<TValues>

  values: TValues

  formState: FormState<TValues>

  state: State

  storeState = new Writable<FormState<TValues>>()

  shouldDisplayAllAssociatedErrors: boolean

  constructor(options?: FormControlOptions<TValues, TContext>) {
    const resolvedOptions = { ...defaultOptions, ...options }

    const defaultValues =
      isObject(resolvedOptions.defaultValues) || isObject(resolvedOptions.values)
        ? cloneObject(resolvedOptions.defaultValues || resolvedOptions.values)
        : {}

    this.options = resolvedOptions

    this.defaultValues = defaultValues

    this.values = resolvedOptions.shouldUnregister ? {} : cloneObject(defaultValues)

    this.formState = {
      submitCount: 0,
      isDirty: false,
      isLoading: typeof resolvedOptions.defaultValues === 'function',
      isValidating: false,
      isSubmitted: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
      touchedFields: {},
      dirtyFields: {},
      errors: {},
    }

    this.storeState.set(this.formState)

    this.state = 'idle'

    this.shouldDisplayAllAssociatedErrors = resolvedOptions.criteriaMode === VALIDATION_MODE.all
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
    return safeGetMultiple(this.values, names)
  }

  register<T extends TParsedForm['keys']>(name: T, options: RegisterOptions<TValues, T> = {}) {
    const alreadyRegisteredField = safeGet<Field | undefined>(this.fields, name)

    deepSet(this.fields, name, {
      ...alreadyRegisteredField,
      _f: {
        ...(alreadyRegisteredField?._f ?? { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    })

    this.names.mount.add(name)

    if (alreadyRegisteredField) {
      this.updateDisabledField({ field: alreadyRegisteredField, disabled: options.disabled, name })
    } else {
      this.updateValidAndValue(name, true, options.value)
    }

    const disabledIsDefined = options.disabled

    return {
      ...(disabledIsDefined ? { disabled: options.disabled } : {}),
      ...(this.options.progressive
        ? {
            required: !!options.required,
            min: getRuleValue(options.min),
            max: getRuleValue(options.max),
            minLength: getRuleValue<number>(options.minLength) as number,
            maxLength: getRuleValue(options.maxLength) as number,
            pattern: getRuleValue(options.pattern) as string,
          }
        : {}),
      name,
      // onChange,
      // onBlur: onChange,
      ref: (ref: HTMLInputElement | null): void => {
        if (ref) {
          this.register(name, options)
          const field = safeGet(this.fields, name)

          const fieldRef =
            ref.value == null
              ? ref.querySelectorAll
                ? (ref.querySelectorAll('input,select,textarea')[0] as FieldElement) || ref
                : ref
              : ref

          const radioOrCheckbox = isRadioInput(fieldRef) || isCheckBoxInput(fieldRef)

          const refs = field._f.refs || []

          const existingField = radioOrCheckbox
            ? refs.find((option: FieldElement) => option === fieldRef)
            : fieldRef === field._f.ref

          if (existingField) {
            return
          }

          deepSet(this.fields, name, {
            _f: {
              ...field._f,
              ...(radioOrCheckbox
                ? {
                    refs: [
                      ...refs.filter((ref: FieldElement) => isHTMLElement(ref) && ref.isConnected),
                      fieldRef,
                      ...(Array.isArray(safeGet(this.defaultValues, name)) ? [{}] : []),
                    ],
                    ref: { type: fieldRef.type, name },
                  }
                : { ref: fieldRef }),
            },
          })

          this.updateValidAndValue(name, false, undefined, fieldRef)
        } else {
          const field = safeGet(this.fields, name) ?? {}

          if (field._f) {
            field._f.mount = false
          }

          if (
            (this.options.shouldUnregister || options.shouldUnregister) &&
            !(this.names.array.has(name) && this.state === 'action')
          ) {
            this.names.unMount.add(name)
          }
        }
      },
    }
  }

  updateDisabledField(options: any) {
    const { disabled, name, field, fields } = options
    if (typeof disabled !== 'boolean') {
      return
    }

    const value =
      (disabled ? undefined : safeGet(this.values, name)) ??
      getFieldValue(field ? field._f : safeGet(fields, name)._f)

    deepSet(this.values, name, value)

    this.updateDirtyField(name, value)
  }

  async trigger(
    name?: TParsedForm['keys'] | TParsedForm['keys'][] | readonly TParsedForm['keys'][],
    options?: TriggerOptions,
  ): Promise<TriggerResult<TValues>> {
    this.stores.state.set({ isValidating: true })

    const fieldNames = (name == null || Array.isArray(name) ? name : [name]) as string[] | undefined

    // Fallback to native validation if no resolver provided.

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate(fieldNames)

      const isValid = validationResult.valid

      this.stores.state.set({
        ...(typeof name === 'string' && isValid === this.formState.isValid && { name }),
        ...(!name && { isValid }),
        errors: this.formState.errors,
        isValidating: false,
      })

      if (options?.shouldFocus && !isValid) {
        const callback = (key?: string) => key && safeGet(this.formState.errors, key)
        focusFieldBy(this.fields, callback, name ? fieldNames : this.names.mount)
      }

      return { validationResult, isValid }
    }

    // Pass the form values through the provided resolver.

    const resolverOptions = getResolverOptions(
      fieldNames ?? this.names.mount,
      this.fields,
      this.options.criteriaMode,
      this.options.shouldUseNativeValidation,
    )

    const resolverResult = await this.options.resolver(
      this.values,
      this.options.context,
      resolverOptions,
    )

    this.processResolverResult(resolverResult, fieldNames)

    const isValid = resolverResult.errors == null || isEmptyObject(resolverResult.errors)

    this.formState.isValid = isValid

    this.stores.state.set({
      ...(typeof name === 'string' && isValid === this.formState.isValid && { name }),
      isValid,
      errors: this.formState.errors,
      isValidating: false,
    })

    if (options?.shouldFocus && !isValid) {
      const callback = (key?: string) => key && safeGet(this.formState.errors, key)
      focusFieldBy(this.fields, callback, name ? fieldNames : this.names.mount)
    }

    return { resolverResult, isValid }
  }

  setFieldValue(name: string, value: any, options: SetValueOptions = {}) {
    const field = safeGet<Field | undefined>(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    if (!fieldReference.disabled) {
      deepSet(this.values, name, getFieldValueAs(value, fieldReference))
    }

    /**
     * TODO: testing, register a real DOM element for the ref.
     */
    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    const updateResult = updateFieldReference(fieldReference, fieldValue)

    if (updateResult === 'custom') {
      this.stores.values.set({ name, values: { ...this.values } })
    }

    this.touch(name, fieldValue, options)
  }

  async touch(name: string, value: unknown, options?: SetValueOptions) {
    const dirtyResult =
      (!options?.shouldTouch || options.shouldDirty) && this.updateDirtyField(name, value)

    const touchedResult = options?.shouldTouch && this.updateTouchedFields(name)

    if (dirtyResult || touchedResult) {
      this.stores.state.set({
        ...(dirtyResult && {
          isDirty: this.formState.isDirty,
          dirtyFields: this.formState.dirtyFields,
        }),
        ...(touchedResult && { touchedFields: this.formState.touchedFields }),
      })
    }

    if (options?.shouldValidate) {
      await this.trigger(name as any)
    }
  }

  updateValidAndValue(
    name: string,
    shouldSkipSetValueAs: boolean,
    value?: unknown,
    ref?: FieldElement,
  ) {
    const field: Field = safeGet(this.fields, name)

    if (field) {
      const defaultValue =
        safeGet(this.values, name) ?? value == null ? safeGet(this.defaultValues, name) : value

      if (defaultValue == null || (ref && (ref as HTMLInputElement).defaultChecked)) {
        if (shouldSkipSetValueAs) {
          deepSet(this.values, name, shouldSkipSetValueAs ? defaultValue : getFieldValue(field._f))
        } else {
          this.setFieldValue(name, defaultValue)
        }
      }

      if (this.state === 'mount') {
        this.updateValid()
      }
    }
  }

  async nativeValidate(
    names?: string | string[] | Nullish,
    shouldOnlyCheckValid?: boolean,
  ): Promise<NativeValidationResult> {
    const fields = deepFilter<FieldRecord>(this.fields, names)

    const validationResult = await nativeValidateFields(fields, this.values, {
      shouldOnlyCheckValid,
      shouldUseNativeValidation: this.options.shouldUseNativeValidation,
      shouldDisplayAllAssociatedErrors: this.shouldDisplayAllAssociatedErrors,
      isFieldArrayRoot: (name) => this.names.array.has(name),
    })

    validationResult.names.forEach((name) => {
      const fieldError = safeGet(validationResult.errors, name)

      // After validation, an affected field name has no errors.
      if (fieldError == null) {
        deepUnset(this.formState.errors, name)
        return
      }

      // After validation, a regular field name has errors.
      if (!this.names.array.has(name)) {
        deepSet(this.formState.errors, name, safeGet(validationResult.errors, name))
        return
      }

      // After validation, a field array root name has errors.
      const fieldArrayErrors = safeGet(this.formState.errors, name)
      deepSet(fieldArrayErrors, 'root', fieldError[name])
      deepSet(this.formState.errors, name, fieldArrayErrors)
    })

    return validationResult
  }

  processResolverResult(result: ResolverResult<TValues>, names?: string[]): void {
    if (!names?.length) {
      this.formState.errors = result.errors ?? {}
      return
    }

    for (const name of names) {
      const error = safeGet(result.errors, name)

      if (error) {
        deepSet(this.formState.errors, name, error)
      } else {
        deepUnset(this.formState.errors, name)
      }
    }
  }

  /**
   * Updates a field's dirty status.
   *
   * @returns Whether the field's dirty status changed.
   */
  updateDirtyField(name: string, fieldValue?: unknown): boolean {
    const currentFieldIsClean = deepEqual(safeGet(this.defaultValues, name), fieldValue)

    const previousIsDirty = safeGet(this.formState.dirtyFields, name)

    if (currentFieldIsClean && previousIsDirty) {
      deepUnset(this.formState.dirtyFields, name)
    }

    if (!currentFieldIsClean && !previousIsDirty) {
      deepSet(this.formState.dirtyFields, name, true)
    }

    return !previousIsDirty === !currentFieldIsClean
  }

  /**
   * Updates the specified field name to be touched.
   *
   * @returns Whether the field's touched status changed.
   */
  updateTouchedFields(name: string): boolean {
    const previousIsTouched = safeGet(this.formState.touchedFields, name)

    if (!previousIsTouched) {
      deepSet(this.formState.touchedFields, name, true)
    }

    return !previousIsTouched
  }

  /**
   * {@link formState.isValid} is not always synchronized with the actual form values.
   * This updates the form state to match with {@link getDirty}.
   *
   * @returns Whether the form's dirty status changed.
   */
  updateIsDirty(): boolean {
    const previousIsDirty = this.formState.isDirty

    const isDirty = this.getDirty()

    this.formState.isDirty = isDirty

    return previousIsDirty !== isDirty
  }

  async updateValid(shouldUpdateValid?: boolean) {
    if (!shouldUpdateValid) {
      return
    }

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate()

      const isValid = validationResult.valid

      if (isValid !== this.formState.isValid) {
        this.formState.isValid = isValid
        this.stores.state.set({ isValid })
      }

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
      this.values,
      this.options.context,
      resolverOptions,
    )

    this.processResolverResult(resolverResult)

    const isValid = resolverResult.errors == null || isEmptyObject(resolverResult.errors)

    if (isValid !== this.formState.isValid) {
      this.formState.isValid = isValid
      this.stores.state.set({ isValid })
    }
  }

  /**
   * Calculates whether the current form values are dirty.
   * The form state may not always match this calculation, i.e. until it's update accordingly.
   */
  getDirty(): boolean {
    return !deepEqual(this.values, this.defaultValues)
  }
}