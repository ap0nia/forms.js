import type {
  CriteriaMode,
  RevalidationEvent,
  SubmissionValidationMode,
  ValidationEvent,
} from './constants'
import type { FieldErrors } from './types/errors'
import type { Field, FieldRecord } from './types/fields'
import type { ParseForm } from './types/parse'
import type { Resolver } from './types/resolver'
import type { DeepMap } from './utils/deep-map'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults } from './utils/defaults'

export type FormControlState<T = Record<string, any>> = {
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

export type FieldState = {
  invalid: boolean
  isDirty: boolean
  isTouched: boolean
  error?: FieldErrors[string]
}

export type FormControlOptions<TValues = Record<string, any>, TContext = any> = {
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

export type ResolvedFormControlOptions<TValues, TContext> = FormControlOptions<
  TValues,
  TContext
> & {
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

export type SetValueResult = {
  isDirty: boolean
  dirtyFieldsChanged: boolean
  touchedFieldsChanged: boolean
}

export type WatchOptions<
  T = Record<string, any>,
  TParsedForm extends ParseForm<T> = ParseForm<T>,
> = {
  name?: keyof TParsedForm | (keyof TParsedForm)[]
  disabled?: boolean
  exact?: boolean
}

export type HandlerCallback = (event?: Partial<Event>) => Promise<void>

export type SubmitHandler<T, TTransformed = T> = TTransformed extends Record<string, any>
  ? (data: TTransformed, event?: Partial<Event>) => unknown
  : (data: T, event?: Partial<Event>) => unknown

export type SubmitErrorHandler<T = Record<string, any>> = (
  errors: FieldErrors<T>,
  event?: Partial<Event>,
) => unknown
