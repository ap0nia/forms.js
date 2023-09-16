import {
  VALIDATION_MODE,
  type CriteriaMode,
  type ValidationMode,
  type RevalidationMode,
  type State,
} from './constants'
import type { FieldErrors } from './logic/errors'
import {
  getFieldValue,
  type Field,
  type FieldElement,
  type FieldRecord,
  getFieldValueAs,
} from './logic/fields'
import { focusFieldBy } from './logic/focus-field-by'
import { fieldsAreNativelyValid } from './logic/native-validation'
import { getResolverOptions, type Resolver } from './logic/resolver'
import { updateFieldArrayRootError } from './logic/update-field-array-root-error'
import { updateFieldReference } from './logic/update-field-reference'
import type { Validate, ValidationRule } from './logic/validation'
import { Writable } from './state/store'
import { cloneObject } from './utils/clone-object'
import { deepEqual } from './utils/deep-equal'
import { deepSet } from './utils/deep-set'
import { deepUnset } from './utils/deep-unset'
import { isHTMLElement } from './utils/html/is-html-element'
import { isEmptyObject } from './utils/is-empty-object'
import { isObject } from './utils/is-object'
import { safeGet, safeGetMultiple } from './utils/safe-get'
import type { DeepMap } from './utils/types/deep-map'
import type { DeepPartial } from './utils/types/deep-partial'
import type { FlattenObject } from './utils/types/flatten-object'
import type { MapObjectKeys } from './utils/types/map-object-keys'
import type { MaybePromise } from './utils/types/maybe-promise'
import type { ParsedForm } from './utils/types/parsed-form'

export type FormControlOptions<TValues extends Record<string, any>, TContext = any> = {
  mode?: keyof ValidationMode

  revalidateMode?: keyof RevalidationMode

  defaultValues?: DeepPartial<TValues> | (() => MaybePromise<DeepPartial<TValues>>)

  values?: TValues

  resetOptions?: KeepStateOptions

  resolver?: Resolver<TValues, TContext>

  context?: TContext

  shouldFocusError?: boolean

  shouldUnregister?: boolean

  shouldUseNativeValidation?: boolean

  progressive?: boolean

  criteriaMode?: CriteriaMode

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
 * Options when registering a new field component or element.
 *
 * @param TFieldName A key in the flattened form values object.
 * @param TFieldValue Represents the value at TFieldName in the flattened form values object.
 *
 * @remarks Please don't manually set TFieldValue :^)
 */
export type RegisterOptions<
  TValues extends Record<string, any> = Record<string, any>,
  TFieldName extends keyof FlattenObject<TValues> = keyof FlattenObject<TValues>,
  TFieldValue = FlattenObject<TValues>[TFieldName],
> = {
  /**
   * Native validation, makes the field required.
   */
  required?: string | ValidationRule<boolean>

  /**
   * Native validation, indicates the minimum value or number of characters.
   */
  min?: ValidationRule<number | string>

  /**
   * Native validation, indicates the maximum value or number of characters.
   */
  max?: ValidationRule<number | string>

  /**
   * Native validation, indicates the minimum number of characters.
   */
  maxLength?: ValidationRule<number>

  /**
   * Native validation, indicates the maximum number of characters.
   */
  minLength?: ValidationRule<number>

  /**
   * This implementation is different because it flattens the object,
   * and then accesses the value at some key in the flattened object.
   */
  validate?: Validate<TFieldValue, TValues> | Record<string, Validate<TFieldValue, TValues>>

  /**
   * The value of the field.
   */
  value?: TFieldValue

  /**
   * Not sure what this is.
   */
  setValueAs?: (value: any) => any

  /**
   * Not sure when this is checked or what it's used for.
   */
  shouldUnregister?: boolean

  /**
   * Not sure.
   */
  onChange?: (event: any) => void

  /**
   * Something.
   */
  onBlur?: (event: any) => void

  /**
   * Whether the field is disabled.
   */
  disabled?: boolean

  /**
   * Dependencies?
   */
  deps?: string | string[]
} & AdditionalRegisterOptions

/**
 * Additional register options.
 */
export type AdditionalRegisterOptions =
  | AdditionalValidationOptions<RegExp, false, false>
  | AdditionalValidationOptions<never, false, true>
  | AdditionalValidationOptions<never, true, false>

/**
 * More native validation options.
 */
export type AdditionalValidationOptions<TPattern, TValueAsNumber, TValueAsDate> = {
  /**
   * Regular expression to validate the field.
   */
  pattern?: ValidationRule<TPattern>

  /**
   * Native validation, indicates the value is a number.
   */
  valueAsNumber?: TValueAsNumber

  /**
   * Native validation, indicates the value is a date.
   */
  valueAsDate?: TValueAsDate
}

export type SetValueOptions = {
  shouldValidate?: boolean
  shouldDirty?: boolean
  shouldTouch?: boolean
}

export type FormState<T> = {
  isDirty: boolean
  isLoading: boolean
  isSubmitted: boolean
  isSubmitSuccessful: boolean
  isSubmitting: boolean
  isValidating: boolean
  isValid: boolean
  submitCount: number
  defaultValues?: undefined | Readonly<DeepPartial<T>>
  dirtyFields: Partial<Readonly<DeepMap<T, boolean>>>
  touchedFields: Partial<Readonly<DeepMap<T, boolean>>>
  errors: FieldErrors<T>
}

export type TriggerOptions = {
  shouldFocus?: boolean
}

const defaultOptions: FormControlOptions<any> = {
  mode: VALIDATION_MODE.onSubmit,
  revalidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
}

export class FormControl<
  TValues extends Record<string, any>,
  TContext = any,
  TParsedForm extends ParsedForm<TValues> = ParsedForm<TValues>,
> {
  options: FormControlOptions<TValues, TContext>

  defaultValues: DeepPartial<TValues>

  values: TValues

  context: TContext

  fields: FieldRecord = {}

  /**
   * Names of fields doing something.
   */
  names = {
    mount: new Set<string>(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
  }

  /**
   * Current state of the form?
   */
  formState: FormState<TValues>

  /**
   * Idk.
   */
  proxyFormState = {
    /**
     * Whether to update the form's dirty state?
     */
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  }

  stores = {
    values: new Writable<{ name: string; values: TValues }>(),
    state: new Writable<Partial<FormState<TValues>> & { name?: string }>(),
  }

  state: State

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

    this.context = {} as TContext

    this.state = 'idle'

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

    this.shouldDisplayAllAssociatedErrors = resolvedOptions.criteriaMode === VALIDATION_MODE.all
  }

  getValues(): TValues

  getValues<T extends TParsedForm['keys']>(fieldName: T): TParsedForm['flattened'][T]

  getValues<T extends TParsedForm['keys'][]>(
    names: readonly [...T],
  ): MapObjectKeys<TParsedForm['flattened'], T>

  getValues<T extends TParsedForm['keys'][]>(
    ...names: readonly [...T]
  ): MapObjectKeys<TParsedForm['flattened'], T>

  getValues(...fieldNames: any[]): any {
    const names = fieldNames.length > 1 ? fieldNames : fieldNames[0]
    return safeGetMultiple(this.values, names)
  }

  register<T extends TParsedForm['keys']>(name: T, options: RegisterOptions<TValues, T> = {}) {
    const field = safeGet<Field | undefined>(this.fields, name)

    // const disabledIsDefined = options.disabled

    deepSet(this.fields, name, {
      ...field,
      _f: {
        ...(field?._f ?? { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    })

    this.names.mount.add(name)

    if (field) {
      // this.updateDisabledField({ field, disabled: options.disabled, name })
    } else {
      this.updateValidAndValue(name, true, options.value)
    }
  }

  updateValidAndValue(name: string, skipSetValueAs: boolean, value?: unknown, ref?: FieldElement) {
    const field = safeGet<Field | undefined>(this.fields, name)

    if (!field) {
      return
    }

    /**
     * TODO: figure out why it prioritizes current value over the provided value.
     */
    const defaultValue =
      safeGet(this.values, name) ?? value == null ? safeGet(this.defaultValues, name) : value

    if (defaultValue == null || (ref as HTMLInputElement)?.defaultChecked || skipSetValueAs) {
      deepSet(this.values, name, skipSetValueAs ? defaultValue : getFieldValue(field._f))
    } else {
      this.setFieldValue(name, defaultValue)
    }

    if (this.state === 'mount') {
      this.updateValid()
    }
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

  touch(name: string, value: unknown, options: SetValueOptions) {
    if (options.shouldTouch) {
      const result = this.updateTouchedAndDirty(name, value, options.shouldDirty)

      if (result) {
        this.stores.state.set(result)
      }
    }

    if (options.shouldValidate) {
      this.trigger(name as any)
    }
  }

  updateTouchedAndDirty(name: string, fieldValue: unknown, shouldDirty?: boolean) {
    const updateDirtyFieldsResult = shouldDirty
      ? this.updateDirtyFields(name, fieldValue)
      : undefined

    const updateTouchedFieldsResult = this.updateTouchedFields(name)

    const shouldUpdateField =
      updateDirtyFieldsResult?.shouldUpdate || updateTouchedFieldsResult?.shouldUpdate

    return shouldUpdateField
      ? {
          isDirty: updateDirtyFieldsResult?.isDirty,
          dirtyFields: updateDirtyFieldsResult?.dirtyFields,
          touchedFields: updateTouchedFieldsResult.touchedFields,
        }
      : undefined
  }

  updateDirtyFields(name: string, fieldValue: unknown) {
    const updateIsDirtyResult = this.proxyFormState.isDirty ? this.updateIsDirty() : undefined

    const currentFieldIsClean = deepEqual(safeGet(this.defaultValues, name), fieldValue)

    const previousIsDirty = safeGet(this.formState.dirtyFields, name)

    if (currentFieldIsClean) {
      deepUnset(this.formState.dirtyFields, name)
    } else {
      deepSet(this.formState.dirtyFields, name, true)
    }

    const shouldUpdate =
      updateIsDirtyResult?.shouldUpdate ||
      (this.proxyFormState.dirtyFields && previousIsDirty !== !currentFieldIsClean)

    return {
      isDirty: updateIsDirtyResult?.isDirty,
      dirtyFields: this.formState.dirtyFields,
      shouldUpdate,
    }
  }

  updateTouchedFields(name: string) {
    const previousIsTouched = safeGet(this.formState.touchedFields, name)

    if (!previousIsTouched) {
      deepSet(this.formState.touchedFields, name, true)
    }

    const touchedFields = !previousIsTouched ? this.formState.touchedFields : undefined

    const shouldUpdate = !previousIsTouched && this.proxyFormState.touchedFields

    return { touchedFields, shouldUpdate }
  }

  updateIsDirty() {
    const previousIsDirty = this.formState.isDirty

    const isDirty = this.getDirty()

    this.formState.isDirty = isDirty

    const shouldUpdate = previousIsDirty !== isDirty

    return { isDirty, shouldUpdate }
  }

  getDirty(): boolean {
    return !deepEqual(this.getValues(), this.defaultValues)
  }

  async trigger(
    name: TParsedForm['keys'] | TParsedForm['keys'][] | readonly TParsedForm['keys'][],
    options?: TriggerOptions,
  ) {
    let isValid
    let validationResult
    const fieldNames = (Array.isArray(name) ? name : [name]) as string[]

    this.updateIsValidating(true)

    if (this.options.resolver) {
      const errors = await this.executeSchemaAndUpdateState(name == null ? name : fieldNames)
      isValid = isEmptyObject(errors)
      validationResult = name ? !fieldNames.some((name) => safeGet(errors, name)) : isValid
    } else if (name) {
      validationResult = (
        await Promise.all(
          fieldNames.map(async (fieldName) => {
            const field = safeGet<any>(this.fields, fieldName)
            return await this.executeBuiltInValidation(
              field?._f ? { [fieldName]: field } : field,
              true,
            )
          }),
        )
      ).every(Boolean)
      !(!validationResult && !this.formState.isValid) && this.updateValid()
    } else {
      validationResult = isValid = await this.executeBuiltInValidation(this.fields, true)
    }

    this.stores.state.set({
      ...(typeof name !== 'string' ||
      (this.proxyFormState.isValid && isValid !== this.formState.isValid)
        ? {}
        : { name }),
      ...(this.options.resolver || !name ? { isValid } : {}),
      errors: this.formState.errors,
      isValidating: false,
    })

    if (options?.shouldFocus && !validationResult) {
      focusFieldBy(
        this.fields,
        (key) => key && safeGet(this.formState.errors, key),
        name ? fieldNames : this.names.mount,
      )
    }

    return validationResult
  }

  async updateValid(shouldUpdateValid?: boolean) {
    if (!(this.proxyFormState.isValid || shouldUpdateValid)) {
      return
    }

    const isValid = await this.validate()

    if (isValid !== this.formState.isValid) {
      this.stores.state.set({ isValid })
    }
  }

  async validate(name?: string[]): Promise<boolean> {
    if (this.options.resolver == null) {
      return await this.executeBuiltInValidation(this.fields, true)
    }

    const resolverOptions = getResolverOptions(
      name || this.names.mount,
      this.fields,
      this.options.criteriaMode,
      this.options.shouldUseNativeValidation,
    )

    const resolverResult = await this.options.resolver(
      this.getValues(),
      this.context,
      resolverOptions,
    )

    return isEmptyObject(resolverResult.errors)
  }

  updateIsValidating(value: boolean) {
    if (this.proxyFormState.isValidating) {
      this.stores.state.set({ isValidating: value })
    }
  }

  async executeSchemaAndUpdateState(names?: string[]) {
    if (this.options.resolver == null) {
      return
    }

    const resolverOptions = getResolverOptions(names || this.names.mount, this.fields)

    const { errors } = await this.options.resolver(this.getValues(), this.context, resolverOptions)

    if (names) {
      for (const name of names) {
        const error = safeGet(errors, name)

        if (error) {
          deepSet(this.formState.errors, name, error)
        } else {
          deepUnset(this.formState.errors, name)
        }
      }
    } else {
      this.formState.errors = errors ?? {}
    }

    return errors
  }

  async executeBuiltInValidation(fields: FieldRecord, shouldOnlyCheckValid?: boolean) {
    const isValid = await fieldsAreNativelyValid(fields, this.getValues(), {
      shouldDisplayAllAssociatedErrors: this.shouldDisplayAllAssociatedErrors,

      shouldUseNativeValidation: this.options.shouldUseNativeValidation && !shouldOnlyCheckValid,

      isFieldArrayRoot: (name) => this.names.array.has(name),

      afterValidation: (field, error, isFieldArrayRoot) => {
        if (shouldOnlyCheckValid) {
          return
        }

        if (!safeGet(error, field._f.name)) {
          deepUnset(this.formState.errors, field._f.name)
          return
        }

        if (isFieldArrayRoot) {
          updateFieldArrayRootError(this.formState.errors, error, field._f.name)
        } else {
          deepSet(this.formState.errors, field._f.name, error[field._f.name])
        }
      },
    })

    if (!shouldOnlyCheckValid) {
      this.formState.errors = {}
    }

    return isValid
  }
}
