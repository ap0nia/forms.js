import { Batchable, Writable } from '@forms.js/common/store'
import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { deepFilter } from '@forms.js/common/utils/deep-filter'
import { deepSet } from '@forms.js/common/utils/deep-set'
import { deepUnset } from '@forms.js/common/utils/deep-unset'
import { isEmptyObject } from '@forms.js/common/utils/is-object'
import type { Nullish } from '@forms.js/common/utils/null'
import { safeGet, safeGetMultiple } from '@forms.js/common/utils/safe-get'
import { toStringArray } from '@forms.js/common/utils/to-string-array'

import { VALIDATION_EVENTS } from './constants'
import { filterFields } from './logic/fields/filter-fields'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getFieldValue, getFieldValueAs } from './logic/fields/get-field-value'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { isHTMLElement } from './logic/html/is-html-element'
import { getValidationMode } from './logic/validation/get-validation-mode'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import type { ErrorOption, FieldErrorRecord, FieldErrors } from './types/errors'
import type { Field, FieldRecord } from './types/fields'
import type {
  FormControlOptions,
  FormControlState,
  ParseForm,
  ResolvedFormControlOptions,
  SetValueOptions,
  TriggerOptions,
  UpdateDisabledFieldOptions,
  WatchOptions,
} from './types/form'
import type { DeepPartial } from './utils/deep-partial'
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

  watch(): TValues

  watch(callback: (data: any, context: { name?: string; type?: string }) => void): () => void

  watch<T extends TParsedForm['keys']>(
    name: T,
    defaultValues?: DeepPartial<TValues>,
    options?: WatchOptions<TValues>,
  ): TParsedForm['values'][T]

  watch<T extends TParsedForm['keys'][]>(
    name: T,
    defaultValues?: DeepPartial<TParsedForm['values']>,
    options?: WatchOptions<TValues>,
  ): KeysToProperties<TParsedForm['values'], T>

  watch(...args: any[]): any {
    if (typeof args[0] === 'function') {
      return this.batchedState.subscribe((state, context) => {
        return args[0](state, context ?? this.options.context)
      })
    }

    const [name, _defaultValues, options] = args

    const nameArray = Array.isArray(name) ? name : name ? [name] : []

    if (nameArray.length > 0) {
      this.batchedState.track('values', nameArray, options)
    } else {
      this.batchedState.keys?.add('values')
    }

    return nameArray.length > 1
      ? deepFilter({ ...this.state.values.value }, nameArray)
      : safeGet({ ...this.state.values.value }, name)
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

  async trigger<T extends TParsedForm['keys']>(
    name?: T | T[] | readonly T[],
    options?: TriggerOptions,
  ): Promise<boolean> {
    const fieldNames = toStringArray(name)

    this.state.isValidating.set(true, fieldNames)

    const result = await this.validate(name as any)

    if (result.validationResult) {
      this.mergeErrors(result.validationResult.errors, result.validationResult.names)
    }

    if (result.resolverResult?.errors) {
      this.mergeErrors(result.resolverResult.errors)
    }

    this.batchedState.open()

    this.state.isValid.set(result.isValid, fieldNames)

    this.state.isValidating.set(false, fieldNames)

    if (options?.shouldFocus && !result.isValid) {
      focusFieldBy(
        this.fields,
        (key?: string) => key && safeGet(this.state.errors.value, key),
        name ? fieldNames : this.names.mount,
      )
    }

    this.state.errors.update((errors) => ({ ...errors }), fieldNames)

    this.batchedState.flush()

    return result.isValid
  }

  touch(name: string, value?: unknown, options?: SetValueOptions): void {
    if (!options?.shouldTouch || options.shouldDirty) {
      this.updateDirtyField(name, value)
    }

    if (options?.shouldTouch) {
      this.updateTouchedField(name)
    }
  }

  //--------------------------------------------------------------------------------------
  // Values.
  //--------------------------------------------------------------------------------------

  setFieldValue(name: string, value: unknown, options?: SetValueOptions) {
    const field: Field | undefined = safeGet(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    updateFieldReference(fieldReference, fieldValue)

    if (!fieldReference.disabled) {
      deepSet(this.state.values.value, name, getFieldValueAs(value, fieldReference))
    }

    this.touch(name, fieldValue, options)

    if (options?.shouldValidate) {
      this.trigger(name as any, { shouldSetErrors: true })
    }
  }

  //--------------------------------------------------------------------------------------
  // Dirty, touched, disabled.
  //--------------------------------------------------------------------------------------

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

  updateDirtyField(name: string, value?: unknown): boolean {
    const defaultValue = safeGet(this.state.defaultValues.value, name)

    const currentIsDirty = !deepEqual(defaultValue, value)

    const previousIsDirty = Boolean(safeGet(this.state.dirtyFields.value, name))

    if (previousIsDirty && !currentIsDirty) {
      this.state.dirtyFields.update((dirtyFields) => {
        deepUnset(dirtyFields, name)
        return dirtyFields
      })
    }

    if (!previousIsDirty && currentIsDirty) {
      this.state.dirtyFields.update((dirtyFields) => {
        deepSet(dirtyFields, name, true)
        return dirtyFields
      })
    }

    if (this.isTracking('isDirty', [name])) {
      this.state.isDirty.set(this.getDirty())
    }

    return currentIsDirty !== previousIsDirty
  }

  //--------------------------------------------------------------------------------------
  // Errors.
  //--------------------------------------------------------------------------------------

  setError<T extends TParsedForm['keys']>(
    name: T | 'root' | `root.${string}`,
    error?: ErrorOption,
    options?: TriggerOptions,
  ): void {
    this.batchedState.open()

    const field: Field | undefined = safeGet(this.fields, name)

    const fieldNames = toStringArray(name)

    this.state.errors.update((errors) => {
      deepSet(errors, name, { ...error, ref: field?._f?.ref })
      return errors
    }, fieldNames)

    this.state.isValid.set(false, fieldNames)

    if (options?.shouldFocus) {
      field?._f?.ref?.focus?.()
    }

    this.batchedState.flush()
  }

  mergeErrors(errors: FieldErrors<TValues> | FieldErrorRecord, names?: string[]): void {
    const namesToMerge = names ?? Object.keys(errors)

    const currentErrors = this.state.errors.value

    const newErrors = names?.length ? currentErrors : {}

    namesToMerge.forEach((name) => {
      const fieldError = safeGet(errors, name)

      if (fieldError == null) {
        deepUnset(newErrors, name)
        return
      }

      if (!this.names.array.has(name)) {
        deepSet(newErrors, name, fieldError)
        return
      }

      const fieldArrayErrors = safeGet(currentErrors, name) ?? {}

      deepSet(fieldArrayErrors, 'root', errors[name])

      deepSet(newErrors, name, fieldArrayErrors)
    })

    this.state.errors.value = newErrors
  }

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
  // Validation.
  //--------------------------------------------------------------------------------------

  async updateValid(force?: boolean, name?: string | string[]): Promise<void> {
    if (force || this.isTracking('isValid', toStringArray(name))) {
      const result = await this.validate()

      const fieldNames = toStringArray(name)

      this.state.isValid.set(result.isValid, fieldNames)
    }
  }

  async validate(name?: string | string[] | Nullish) {
    const nameArray = toStringArray(name)

    if (this.options.resolver == null) {
      const validationResult = await this.nativeValidate(nameArray)

      const isValid = validationResult.valid

      return { validationResult, isValid }
    }

    const names = nameArray ?? Array.from(this.names.mount)

    const fields = filterFields(names, this.fields)

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

  //--------------------------------------------------------------------------------------
  // Internal utilities.
  //--------------------------------------------------------------------------------------

  isTracking(key: keyof typeof this.state, name?: string[]): boolean {
    return (
      this.batchedState.isTracking(key, name) ||
      this.batchedState.childIsTracking(key, name) ||
      this.state[key].subscribers.size > 0
    )
  }
}
