import {
  type ValidationMode,
  type RevalidationMode,
  type CriteriaMode,
  VALIDATION_MODE,
} from './constants'
import type { FieldErrors } from './errors'
import { isFunction } from './guards/is-function'
import type { Resolver } from './resolver'
import type { AnyRecord } from './utils/any-record'
import type { DeepMapObject } from './utils/deep-map-object'
import type { DeepPartial } from './utils/deep-partial'
import type { MaybeAsyncFunction } from './utils/maybe-async-function'

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

export type UseFormProps<TForm extends AnyRecord = AnyRecord, TContext = any> = {
  /**
   * When to validate the form.
   */
  mode?: keyof ValidationMode

  /**
   * When to revalidate the form?
   */
  revalidationMode?: RevalidationMode

  /**
   * Default values assigned to the form when the corresponding field is undefined.
   *
   * @remarks only takes effect on mount and when resetting?
   */
  defaultValues?: DeepPartial<TForm> | MaybeAsyncFunction<DeepPartial<TForm>>

  /**
   * The current form values.
   */
  values?: TForm

  /**
   * What to do when resetting the form.
   */
  resetOptions?: KeepStateOptions

  /**
   * Validates the form.
   */
  resolver?: Resolver<TForm, TContext>

  /**
   * Idk what context is for.
   */
  context?: TContext

  /**
   * Whether to focus the specific field when it has an error.
   *
   * @default true
   */
  shouldFocusError?: boolean

  /**
   * Idk.
   */
  shouldUnregister?: boolean

  /**
   * Idk.
   */
  shouldUseNativeValidation?: boolean

  /**
   * Idk.
   */
  progressive?: boolean

  /**
   * Idk.
   */
  criteriaMode?: CriteriaMode

  /**
   * Idk.
   */
  delayError?: number
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
  defaultValues?: Readonly<DeepPartial<T>>
  dirtyFields: Partial<Readonly<DeepMapObject<T, boolean>>>
  touchedFields: Partial<Readonly<DeepMapObject<T, boolean>>>
  errors: FieldErrors<T>
}

/**
 */
export function useForm<TForm extends AnyRecord = AnyRecord, TContext = any>(
  props: UseFormProps<TForm, TContext>,
) {
  createFormControl<TForm, TContext>(props)
}

const defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const

export function createFormControl<TForm extends AnyRecord = AnyRecord, TContext = any>(
  props: UseFormProps<TForm, TContext>,
): any {
  props

  const _options = {
    ...defaultOptions,
    ...props,
  }

  const _formState: FormState<TForm> = {
    submitCount: 0,
    isDirty: false,
    isLoading: isFunction(_options.defaultValues),
    isValidating: false,
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    touchedFields: {},
    dirtyFields: {},
    errors: {},
  }

  return undefined
}
