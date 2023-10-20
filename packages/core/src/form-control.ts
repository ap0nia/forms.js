import { RecordDerived, Writable } from '@forms.js/common/store'
import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { deepFilter } from '@forms.js/common/utils/deep-filter'
import { deepSet } from '@forms.js/common/utils/deep-set'
import { deepUnset } from '@forms.js/common/utils/deep-unset'
import { isBrowser } from '@forms.js/common/utils/is-browser'
import { isEmptyObject } from '@forms.js/common/utils/is-object'
import { isPrimitive } from '@forms.js/common/utils/is-primitive'
import type { Noop } from '@forms.js/common/utils/noop'
import type { Nullish } from '@forms.js/common/utils/null'
import { safeGet, safeGetMultiple } from '@forms.js/common/utils/safe-get'
import { toStringArray } from '@forms.js/common/utils/to-string-array'

import {
  type CriteriaMode,
  type SubmissionValidationMode,
  VALIDATION_EVENTS,
  type ValidationEvent,
  type RevalidationEvent,
  INPUT_EVENTS,
} from './constants'
import { lookupError } from './logic/errors/lookup-error'
import { filterFields } from './logic/fields/filter-fields'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getCurrentFieldValue } from './logic/fields/get-current-field-value'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import { getFieldValue, getFieldValueAs } from './logic/fields/get-field-value'
import { hasValidation } from './logic/fields/has-validation'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { elementIsLive } from './logic/html/element-is-live'
import { isHTMLElement } from './logic/html/is-html-element'
import { mergeElementWithField } from './logic/html/merge-element-with-field'
import { getValidationMode } from './logic/validation/get-validation-mode'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { shouldSkipValidationAfter } from './logic/validation/should-skip-validation-after'
import type { ErrorOption, FieldErrorRecord, FieldErrors } from './types/errors'
import type { Field, FieldRecord } from './types/fields'
import type { ParseForm } from './types/form'
import type { InputElement } from './types/html'
import type { RegisterOptions } from './types/register'
import type { Resolver } from './types/resolver'
import type { DeepMap } from './utils/deep-map'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults } from './utils/defaults'
import type { KeysToProperties } from './utils/keys-to-properties'
import type { LiteralUnion } from './utils/literal-union'

export type FormControlState<T> = {
  isDirty: boolean
  isLoading: boolean
  isSubmitted: boolean
  isSubmitSuccessful: boolean
  isSubmitting: boolean
  isValidating: boolean
  isValid: boolean
  disabled: boolean
  submitCount: number
  dirtyFields: Partial<Readonly<DeepMap<T, boolean>>>
  touchedFields: Partial<Readonly<DeepMap<T, boolean>>>
  defaultValues: DeepPartial<T>
  errors: FieldErrors<T>
  values: T
}

export type FormControlOptions<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
> = {
  mode?: ValidationEvent[keyof ValidationEvent]
  reValidateMode?: RevalidationEvent[keyof RevalidationEvent]
  disabled?: boolean
  context?: TContext
  defaultValues?: Defaults<TValues>
  values?: TValues
  resetOptions?: ResetOptions
  resolver?: Resolver<TValues, TContext>
  shouldFocusError?: boolean
  shouldUnregister?: boolean
  shouldUseNativeValidation?: boolean
  progressive?: boolean
  criteriaMode?: CriteriaMode[keyof CriteriaMode]
  delayError?: number
}

export type ResolvedFormControlOptions<
  TValues extends Record<string, any>,
  TContext,
> = FormControlOptions<TValues, TContext> & {
  shouldDisplayAllAssociatedErrors: boolean
  submissionValidationMode: SubmissionValidationMode
  shouldCaptureDirtyFields: boolean
}

export type UpdateDisabledFieldOptions = {
  name: string
  disabled?: boolean
  field?: Field
  fields?: FieldRecord
}

export type TriggerOptions = {
  shouldFocus?: boolean
  shouldSetErrors?: boolean
}

export type KeepStateOptions = {
  keepDirtyValues?: boolean
  keepErrors?: boolean
  keepDirty?: boolean
  keepIsSubmitSuccessful?: boolean
  keepTouched?: boolean
  keepIsValid?: boolean
}

export interface ResetOptions extends KeepStateOptions {
  keepValues?: boolean
  keepDefaultValues?: boolean
  keepIsSubmitted?: boolean
  keepSubmitCount?: boolean
}

export interface UnregisterOptions extends KeepStateOptions {
  keepValue?: boolean
  keepDefaultValue?: boolean
  keepError?: boolean
}

export type SetValueOptions = {
  shouldValidate?: boolean
  shouldDirty?: boolean
  shouldTouch?: boolean
  quiet?: boolean
}

export type WatchOptions<
  T extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<T> = ParseForm<T>,
> = {
  name?: TParsedForm['keys'] | TParsedForm['keys'][]
  control?: FormControl<T>
  disabled?: boolean
  exact?: boolean
}

export type HandlerCallback = (event?: Event) => Promise<void>

export type SubmitHandler<T, TTransformed> = TTransformed extends Record<string, any>
  ? (data: TTransformed, event?: Event) => unknown
  : (data: T, event?: Event) => unknown

export type SubmitErrorHandler<T> = (errors: FieldErrors<T>, event?: Event) => unknown

export const defaultFormControlOptions: FormControlOptions<any, any> = {
  mode: VALIDATION_EVENTS.onSubmit,
  reValidateMode: VALIDATION_EVENTS.onChange,
  shouldFocusError: true,
}

export class FormControl<
  TValues extends Record<string, any> = Record<string, any>,
  TContext = any,
  TTransformedValues extends Record<string, any> | undefined = undefined,
  TParsedForm extends ParseForm<TValues> = ParseForm<TValues>,
> {
  options: ResolvedFormControlOptions<TValues, TContext>

  state: { [K in keyof FormControlState<TValues>]: Writable<FormControlState<TValues>[K]> }

  derivedState: RecordDerived<this['state']>

  mounted = false

  fields: FieldRecord = {}

  names = {
    mount: new Set<string>(),
    unMount: new Set<string>(),
    array: new Set<string>(),
  }

  unmountActions: Noop[] = []

  valueListeners: Noop[] = []

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

    this.derivedState = new RecordDerived(this.state, new Set())

    if (isLoading) {
      this.resetDefaultValues(initialDefaultValues, true)
    }
  }

  getDirty(): boolean {
    return !deepEqual(this.state.defaultValues.value, this.state.values.value)
  }

  focusError(options?: TriggerOptions) {
    if (options?.shouldFocus || (options == null && this.options.shouldFocusError)) {
      focusFieldBy(
        this.fields,
        (key) => key && safeGet(this.state.errors.value, key),
        this.names.mount,
      )
    }
  }

  setFocus(name: string, options: { shouldSelect?: boolean } = {}) {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f == null) {
      return
    }

    const fieldRef = field?._f.refs ? field?._f.refs[0] : field?._f.ref

    fieldRef?.focus?.()

    if (options.shouldSelect && fieldRef && 'select' in fieldRef) {
      fieldRef?.select?.()
    }
  }

  get _fields() {
    return this.fields
  }

  isTracking(key: keyof typeof this.state, name?: string[]) {
    return (
      this.derivedState.isTracking(key, name) ||
      this.derivedState.clonesAreTracking(key, name) ||
      this.state[key].subscribers.size
    )
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
      return this.derivedState.subscribe((state, context) => {
        return args[0](state, context ?? this.options.context)
      })
    }

    const [name, _defaultValues, options] = args

    const nameArray = Array.isArray(name) ? name : name ? [name] : []

    if (nameArray.length > 0) {
      this.derivedState.track('values', nameArray, options)
    } else {
      this.derivedState.keys?.add('values')
    }

    return nameArray.length > 1
      ? deepFilter({ ...this.state.values.value }, nameArray)
      : safeGet({ ...this.state.values.value }, name)
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

  async handleChange(event: Event): Promise<void> {
    this.derivedState.freeze()

    const target: any = event.target

    const name = target.name

    const field: Field | undefined = safeGet(this.fields, name)

    if (field == null) {
      return
    }

    const fieldValue = getCurrentFieldValue(event, field)

    this.state.values.update(
      (values) => {
        deepSet(values, name, fieldValue)
        return values
      },
      [name],
    )

    const isBlurEvent = event.type === INPUT_EVENTS.BLUR || event.type === INPUT_EVENTS.FOCUS_OUT

    if (isBlurEvent) {
      field._f.onBlur?.(event)
    } else {
      field._f.onChange?.(event)
    }

    if (isBlurEvent) {
      this.updateTouchedField(name)
    } else {
      this.updateDirtyField(name, fieldValue)
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
      this.derivedState.unfreeze()
      return
    }

    if (!isBlurEvent) {
      this.derivedState.unfreeze()
      this.derivedState.freeze()
    }

    this.derivedState.transaction(() => {
      this.state.isValidating.set(true)
    })

    const result = await this.validate(name)

    if (result.resolverResult) {
      const previousError = lookupError(this.state.errors.value, this.fields, name)

      const currentError = lookupError(
        result.resolverResult.errors ?? {},
        this.fields,
        previousError.name,
      )

      if (currentError.error) {
        deepSet(this.state.errors.value, currentError.name, currentError.error)
      } else {
        deepUnset(this.state.errors.value, currentError.name)
      }

      if (field._f.deps) {
        this.trigger(field._f.deps as any)
      } else {
        this.state.isValid.set(result.isValid, [name])
      }

      this.state.errors.update((errors) => ({ ...errors }), [name])
    }

    if (result.validationResult) {
      const isFieldValueUpdated =
        Number.isNaN(fieldValue) ||
        (fieldValue === safeGet(this.state.values.value, name) ?? fieldValue)

      if (!result.isValid) {
        const error = result.validationResult.errors[name]

        if (isFieldValueUpdated && !error) {
          const fullResult = await this.validate()

          if (fullResult.validationResult?.errors) {
            this.mergeErrors(fullResult.validationResult.errors, fullResult.validationResult.names)
          }
        } else {
          deepSet(this.state.errors.value, name, error)
        }
      } else {
        this.mergeErrors(result.validationResult.errors, result.validationResult.names)
      }

      if (isFieldValueUpdated && field._f.deps) {
        this.trigger(field._f.deps as any)
      } else {
        this.state.isValid.set(result.isValid, [name])
      }

      this.state.errors.update((errors) => ({ ...errors }), [name])
    }

    this.state.isValidating.set(false, [name])
    this.derivedState.unfreeze()
  }

  handleSubmit(
    onValid?: SubmitHandler<TValues, TTransformedValues>,
    onInvalid?: SubmitErrorHandler<TValues>,
  ): HandlerCallback {
    return async (event) => {
      this.derivedState.freeze()

      event?.preventDefault?.()

      this.state.isSubmitting.set(true)

      const { isValid, resolverResult, validationResult } = await this.validate()

      const errors = resolverResult?.errors ?? validationResult?.errors ?? {}

      deepUnset(this.state.errors.value, 'root')

      this.mergeErrors(errors)
      this.state.errors.update((errors) => ({ ...errors }))

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

      this.derivedState.unfreeze()
    }
  }

  registerElement<T extends TParsedForm['keys']>(
    name: Extract<T, string>,
    element: InputElement,
    options?: RegisterOptions<TValues, T>,
  ): void {
    const field = this.registerField(name, options)

    const fieldNames = toStringArray(name)

    const newField = mergeElementWithField(name, field, element)

    const defaultValue =
      safeGet(this.state.values.value, name) ?? safeGet(this.state.defaultValues.value, name)

    if (defaultValue == null || (newField._f.ref as HTMLInputElement)?.defaultChecked) {
      deepSet(this.state.values.value, name, getFieldValue(newField._f))
    } else {
      updateFieldReference(newField._f, defaultValue)
    }

    deepSet(this.fields, name, newField)

    this.updateValid(undefined, fieldNames)
  }

  registerField<T extends TParsedForm['keys']>(
    name: Extract<T, string>,
    options?: RegisterOptions<TValues, T>,
  ) {
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

    if (existingField) {
      this.mockUpdateDisabledField({ field, disabled: options?.disabled, name })
      return field
    }

    const defaultValue =
      safeGet(this.state.values.value, name) ??
      options?.value ??
      safeGet(this.state.defaultValues.value, name)

    deepSet(this.state.values.value, name, defaultValue)

    return field
  }

  unregister<T extends TParsedForm['keys']>(
    name?: Extract<T, string> | Extract<T, string>[],
    options?: UnregisterOptions,
  ): void {
    this.derivedState.freeze()

    const fieldNames = toStringArray(name) ?? Array.from(this.names.mount)

    for (const fieldName of fieldNames) {
      this.names.mount.delete(fieldName)
      this.names.array.delete(fieldName)

      if (!options?.keepValue) {
        deepUnset(this.fields, fieldName)

        this.state.values.update((values) => {
          deepUnset(values, fieldName)
          return values
        }, fieldNames)
      }

      if (!options?.keepError) {
        this.state.errors.update((errors) => {
          deepUnset(errors, fieldName)
          return errors
        }, fieldNames)
      }

      if (!options?.keepDirty) {
        this.state.dirtyFields.update((dirtyFields) => {
          deepUnset(dirtyFields, fieldName)
          return dirtyFields
        }, fieldNames)

        this.state.isDirty.set(this.getDirty(), fieldNames)
      }

      if (!options?.keepTouched) {
        this.state.touchedFields.update((touchedFields) => {
          deepUnset(touchedFields, fieldName)
          return touchedFields
        }, fieldNames)
      }

      if (!this.options.shouldUnregister && !options?.keepDefaultValue) {
        this.state.defaultValues.update((defaultValues) => {
          deepUnset(defaultValues, fieldName)
          return defaultValues
        }, fieldNames)
      }
    }

    if (!options?.keepIsValid) {
      this.updateValid(undefined, fieldNames)
    }

    this.derivedState.unfreeze(true)
  }

  unregisterElement<T extends TParsedForm['keys']>(
    name: LiteralUnion<Extract<T, string>, string>,
    options?: RegisterOptions<TValues, T>,
  ): void {
    const field: Field | undefined = safeGet(this.fields, name)

    if (field?._f) {
      field._f.mount = false
    }

    const shouldUnregister = this.options.shouldUnregister || options?.shouldUnregister

    if (shouldUnregister && !this.names.array.has(name)) {
      this.names.unMount.add(name)
    }
  }

  mount() {
    this.mounted = true
  }

  unmount() {
    this.mounted = false
    this.cleanup()
  }

  cleanup() {
    this.removeUnmounted()
  }

  removeUnmounted(): void {
    for (const name of this.names.unMount) {
      const field: Field | undefined = safeGet(this.fields, name)

      if (field?._f.refs ? !field._f.refs.some(elementIsLive) : !elementIsLive(field?._f.ref)) {
        this.unregister(name as any)
      }
    }

    this.names.unMount = new Set()
  }

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

  setValue<T extends TParsedForm['keys']>(
    name: Extract<T, string>,
    value: TParsedForm['values'][T],
    options?: SetValueOptions,
  ): void {
    this.derivedState.freeze()

    const field: Field | undefined = safeGet(this.fields, name)

    const fieldNames = toStringArray(name)

    const clonedValue = structuredClone(value)

    if (options?.quiet) {
      deepSet(this.state.values.value, name, clonedValue)
    } else {
      this.state.values.update((values) => {
        deepSet(values, name, clonedValue)
        return values
      }, fieldNames)
    }

    const isFieldArray = this.names.array.has(name)

    if (!isFieldArray) {
      if (field && !field._f && clonedValue != null) {
        this.setValues(name, clonedValue, options)
      } else {
        this.setFieldValue(name, clonedValue, options)
      }
    } else if (options?.shouldDirty) {
      this.state.dirtyFields.set(
        getDirtyFields(this.state.defaultValues.value, this.state.values.value),
        fieldNames,
      )
      this.state.isDirty.set(this.getDirty(), fieldNames)
    }

    this.valueListeners.forEach((listener) => listener())

    this.derivedState.unfreeze()
  }

  setValues(name: string, value: any, options?: SetValueOptions): void {
    this.derivedState.freeze()

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

    this.derivedState.unfreeze()
  }

  setFieldValue(name: string, value: unknown, options?: SetValueOptions): void {
    this.derivedState.freeze()

    const field: Field | undefined = safeGet(this.fields, name)

    const fieldReference = field?._f

    if (fieldReference == null) {
      this.touch(name, value, options)
      return
    }

    const fieldValue = isHTMLElement(fieldReference.ref) && value == null ? '' : value

    updateFieldReference(fieldReference, fieldValue)

    if (!fieldReference.disabled) {
      this.state.values.update(
        (values) => {
          deepSet(values, name, getFieldValueAs(value, fieldReference))
          return values
        },
        [name],
      )
    }

    this.touch(name, fieldValue, options)

    if (options?.shouldValidate) {
      this.trigger(name as any)
    }

    this.derivedState.unfreeze()
  }

  async trigger<T extends TParsedForm['keys']>(
    name?: T | T[] | readonly T[],
    options?: TriggerOptions,
  ): Promise<boolean> {
    this.derivedState.freeze()

    const fieldNames = toStringArray(name)

    this.derivedState.transaction(() => {
      this.state.isValidating.set(true, fieldNames)
    })

    const result = await this.validate(name as any)

    if (result.validationResult) {
      this.mergeErrors(result.validationResult.errors, result.validationResult.names)
    }

    if (result.resolverResult?.errors) {
      this.mergeErrors(result.resolverResult.errors)
    }

    this.state.isValid.set(result.isValid, fieldNames)

    this.derivedState.transaction(() => {
      this.state.isValidating.set(false, fieldNames)
    })

    if (options?.shouldFocus && !result.isValid) {
      const callback = (key?: string) => key && safeGet(this.state.errors.value, key)
      focusFieldBy(this.fields, callback, name ? fieldNames : this.names.mount)
    }

    if (options?.shouldSetErrors) {
      this.state.errors.update((errors) => ({ ...errors }), fieldNames)
    }

    this.derivedState.unfreeze()

    return result.isValid
  }

  setError<T extends TParsedForm['keys']>(
    name: T | 'root' | `root.${string}`,
    error?: ErrorOption,
    options?: TriggerOptions,
  ): void {
    this.derivedState.freeze()

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

    this.derivedState.unfreeze()
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

  clearErrors(name?: string | string[]) {
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

  touch(name: string, value?: unknown, options?: SetValueOptions): void {
    if (!options?.shouldTouch || options.shouldDirty) {
      this.updateDirtyField(name, value)
    }

    if (options?.shouldTouch) {
      this.updateTouchedField(name)
    }
  }

  updateTouchedField(name: string): boolean {
    const previousIsTouched = safeGet(this.state.touchedFields.value, name)

    if (!previousIsTouched) {
      this.state.touchedFields.update(
        (touchedFields) => {
          deepSet(touchedFields, name, true)
          return touchedFields
        },
        [name],
      )
    }

    return !previousIsTouched
  }

  updateDirtyField(name: string, value?: unknown): boolean {
    const { previousIsDirty, currentIsDirty, isDirty } = this.mockUpdateDirtyField(name, value)

    if (this.state.isDirty.value !== isDirty) {
      this.state.isDirty.set(currentIsDirty, [name])
    }

    if (currentIsDirty != previousIsDirty) {
      this.state.dirtyFields.update((dirtyFields) => ({ ...dirtyFields }), [name])
    }

    return currentIsDirty !== previousIsDirty
  }

  updateDisabledField(options: UpdateDisabledFieldOptions): void {
    const changed = this.mockUpdateDisabledField(options)

    if (changed) {
      this.derivedState.freeze()

      this.state.values.update((values) => ({ ...values }))

      this.state.dirtyFields.update((dirtyFields) => ({ ...dirtyFields }))

      this.derivedState.unfreeze()
    }
  }

  mockUpdateDisabledField(options: UpdateDisabledFieldOptions): boolean {
    if (typeof options.disabled !== 'boolean') {
      return false
    }

    const value = options.disabled
      ? undefined
      : safeGet(this.state.values.value, options.name) ??
        getFieldValue(options.field?._f ?? safeGet(options.fields, options.name)._f)

    deepSet(this.state.values.value, options.name, value)

    this.mockUpdateDirtyField(options.name, value)

    return true
  }

  mockUpdateDirtyField(name: string, value?: unknown) {
    const defaultValue = safeGet(this.state.defaultValues.value, name)

    const currentIsDirty = !deepEqual(defaultValue, value)

    const previousIsDirty = Boolean(safeGet(this.state.dirtyFields.value, name))

    if (previousIsDirty && !currentIsDirty) {
      deepUnset(this.state.dirtyFields.value, name)
    }

    if (!previousIsDirty && currentIsDirty) {
      deepSet(this.state.dirtyFields.value, name, true)
    }

    const isDirty = this.isTracking('isDirty', toStringArray(name))
      ? this.getDirty()
      : this.state.isDirty.value

    return { previousIsDirty, currentIsDirty, isDirty }
  }

  reset(
    formValues?: Defaults<TValues> extends TValues ? TValues : Defaults<TValues>,
    options?: ResetOptions,
  ): void {
    this.derivedState.freeze()

    const updatedValues = formValues ? structuredClone(formValues) : this.state.defaultValues.value

    const cloneUpdatedValues = structuredClone(updatedValues)

    const values =
      formValues && isEmptyObject(formValues) ? this.state.defaultValues.value : cloneUpdatedValues

    if (!options?.keepDefaultValues) {
      this.state.defaultValues.set(updatedValues as DeepPartial<TValues>)
    }

    if (!options?.keepValues) {
      if (options?.keepDirtyValues || this.options.shouldCaptureDirtyFields) {
        this.setDirtyValues(values)
      } else {
        if (isBrowser() && formValues == null) {
          this.resetFormElement()
        }
        this.fields = {}
      }

      const newValues = this.options.shouldUnregister
        ? options?.keepDefaultValues
          ? structuredClone(this.state.defaultValues.value)
          : {}
        : structuredClone(values)

      this.state.values.set(newValues as TValues, true)
    }

    this.names = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
    }

    if (!options?.keepSubmitCount) {
      this.state.submitCount.set(0)
    }

    if (!options?.keepDirty) {
      this.state.isDirty.set(
        Boolean(
          options?.keepDefaultValues && !deepEqual(formValues, this.state.defaultValues.value),
        ),
      )
    }

    if (!options?.keepDirtyValues) {
      if (options?.keepDefaultValues && formValues) {
        this.state.dirtyFields.set(getDirtyFields(this.state.defaultValues.value, formValues))
      } else {
        this.state.dirtyFields.set({})
      }
    }

    if (!options?.keepTouched) {
      this.state.touchedFields.set({})
    }

    if (!options?.keepErrors) {
      this.state.errors.set({})
    }

    if (!options?.keepIsSubmitSuccessful) {
      this.state.isSubmitSuccessful.set(false)
    }

    this.state.isSubmitting.set(false)

    this.valueListeners.forEach((listener) => listener())

    this.derivedState.unfreeze()
  }

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
      resolvedDefaultValues = await resolvingDefaultValues
    }

    this.derivedState.freeze()

    this.state.defaultValues.set((resolvedDefaultValues ?? {}) as any)

    if (resetValues) {
      const newValues = structuredClone(resolvedDefaultValues)
      this.state.values.set(newValues as TValues)
    }

    this.state.isLoading.set(false)

    this.derivedState.unfreeze()
  }

  setDirtyValues(values: unknown) {
    for (const fieldName of this.names.mount) {
      if (safeGet(this.state.dirtyFields.value, fieldName)) {
        deepSet(values, fieldName, safeGet(this.state.values.value, fieldName))
      } else {
        this.setValue(fieldName as any, safeGet(values, fieldName), { quiet: true })
      }
    }
  }

  resetFormElement() {
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
}
