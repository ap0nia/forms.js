import type {
  CriteriaMode,
  RevalidationEvent,
  SubmissionValidationMode,
  ValidationEvent,
} from '../constants'
import type { DeepMap } from '../utils/deep-map'
import type { DeepPartial } from '../utils/deep-partial'
import type { Defaults } from '../utils/defaults'
import type { FlattenObject as FlattenFormValues } from '../utils/flatten-object'

import type { FieldErrors } from './errors'
import type { Field, FieldRecord } from './fields'
import type { Resolver } from './resolver'

/**
 * Helper type to get all the field names of a form.
 *
 * Field names are dot-concatenated properties and are valid HTML field names.
 */
export type FormFieldNames<T> = Extract<keyof FlattenFormValues<T>, string>

/**
 * Helper type to flatten all of a form's nested properties into a single layer fieldname -> value object.
 */
export type { FlattenFormValues }

/**
 * Parses a form into its flattened keys and values
 *
 * A key is a field name, and can be used to access the flattened values.
 */
export type ParseForm<T, TFlattenedValues extends FlattenFormValues<T> = FlattenFormValues<T>> = {
  values: TFlattenedValues
  keys: Extract<keyof TFlattenedValues, string>
}

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

export type SetValueResult = {
  isDirty: boolean
  dirtyFieldsChanged: boolean
  touchedFieldsChanged: boolean
}

export type WatchOptions<
  T extends Record<string, any> = Record<string, any>,
  TParsedForm extends ParseForm<T> = ParseForm<T>,
> = {
  name?: TParsedForm['keys'] | TParsedForm['keys'][]
  disabled?: boolean
  exact?: boolean
}

export type HandlerCallback = (event?: Partial<Event>) => Promise<void>

export type SubmitHandler<T, TTransformed = T> = TTransformed extends Record<string, any>
  ? (data: TTransformed, event?: Partial<Event>) => unknown
  : (data: T, event?: Partial<Event>) => unknown

export type SubmitErrorHandler<T> = (errors: FieldErrors<T>, event?: Partial<Event>) => unknown
