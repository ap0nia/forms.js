import {
  VALIDATION_MODE,
  type CriteriaMode,
  type ValidationMode,
  type RevalidationMode,
} from './constants'
import { cloneObject } from './utils/clone-object'
import { isObject } from './utils/is-object'
import { safeGetMultiple } from './utils/safe-get'
import type { DeepPartial } from './utils/types/deep-partial'
import type { MapObjectKeys } from './utils/types/map-object-keys'
import type { MaybePromise } from './utils/types/maybe-promise'
import type { ParsedForm } from './utils/types/parsed-form'

export type FormControlOptions<TValues extends Record<string, any>, TContext = any> = {
  mode?: keyof ValidationMode

  revalidateMode?: keyof RevalidationMode

  defaultValues?: DeepPartial<TValues> | (() => MaybePromise<DeepPartial<TValues>>)

  values?: TValues

  resetOptions?: KeepStateOptions

  resolver?: any

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

const defaultOptions: FormControlOptions<any> = {
  mode: VALIDATION_MODE.onSubmit,
  revalidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
}

export interface RegisterOptions<TValues, TContext> {
  mode: keyof ValidationMode
  reValidateMode: keyof RevalidationMode
  defaultValues: DefaultValues<TValues> | AsyncDefaultValues<TValues>
  values: TValues
  resetOptions: KeepStateOptions
  resolver: Resolver<TValues, TContext>
  context: TContext
  shouldFocusError: boolean
  shouldUnregister: boolean
  shouldUseNativeValidation: boolean
  progressive: boolean
  criteriaMode: CriteriaMode
  delayError: number
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

  constructor(options?: FormControlOptions<TValues, TContext>) {
    const resolvedOptions = { ...defaultOptions, ...options }

    const defaultValues =
      isObject(resolvedOptions.defaultValues) || isObject(resolvedOptions.values)
        ? cloneObject(resolvedOptions.defaultValues || resolvedOptions.values)
        : {}

    this.options = resolvedOptions

    this.defaultValues = defaultValues

    this.values = resolvedOptions.shouldUnregister ? {} : structuredClone(defaultValues)

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

  getValues(...fieldNames: any): any {
    const names = fieldNames.length > 1 ? fieldNames : fieldNames[0]
    return safeGetMultiple(this.values, names)
  }

  register() {}
}
