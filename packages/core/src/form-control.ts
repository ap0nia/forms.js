import {
  VALIDATION_MODE,
  type CriteriaMode,
  type ValidationMode,
  type RevalidationMode,
} from './constants'
import { getFieldValue, type Field, type FieldElement, type FieldRecord } from './logic/fields'
import type { Resolver } from './logic/resolver'
import type { Validate, ValidationRule } from './logic/validation'
import { cloneObject } from './utils/clone-object'
import { deepSet } from './utils/deep-set'
import { isObject } from './utils/is-object'
import { safeGet, safeGetMultiple } from './utils/safe-get'
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
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
  }

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

    const defaultValue =
      safeGet(this.values, name) ?? value == null ? safeGet(this.defaultValues, name) : value

    if (defaultValue == null || (ref as HTMLInputElement)?.defaultChecked || skipSetValueAs) {
      deepSet(this.values, name, skipSetValueAs ? defaultValue : getFieldValue(field._f))
    }

    // else {
    //   setFieldValue(name, defaultValue)
    // }

    // if (this.state.mount) {
    //   this.updateValid()
    // }
  }
}
