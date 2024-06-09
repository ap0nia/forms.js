import { Batchable, Writable } from '@forms.js/common/store'
import { deepEqual } from '@forms.js/common/utils/deep-equal'
import { deepFilter } from '@forms.js/common/utils/deep-filter'
import { set } from '@forms.js/common/utils/set'
import { unset } from '@forms.js/common/utils/unset'
import { isBrowser } from '@forms.js/common/utils/is-browser'
import { isObject } from '@forms.js/common/utils/is-object'
import { isEmptyObject } from '@forms.js/common/utils/is-empty-object'
import { isPrimitive } from '@forms.js/common/utils/is-primitive'
import type { Nullish } from '@forms.js/common/utils/null'
import { get, getMultiple } from '@forms.js/common/utils/get'
import { stringToPath } from '@forms.js/common/utils/string-to-path'

import {
  VALIDATION_EVENTS,
  type CriteriaMode,
  type RevalidationEvent,
  type SubmissionValidationMode,
  type ValidationEvent,
} from './constants'

import { lookupError } from './logic/errors/lookup-error'
import { filterFields } from './logic/fields/filter-fields'
import { focusFieldBy } from './logic/fields/focus-field-by'
import { getFieldEventValue } from './logic/fields/get-field-event-value'
import { getDirtyFields } from './logic/fields/get-dirty-fields'
import { getFieldValue, getFieldValueAs } from './logic/fields/get-field-value'
import { hasValidation } from './logic/fields/has-validation'
import { iterateFieldsByAction } from './logic/fields/iterate-fields-by-action'
import { updateFieldReference } from './logic/fields/update-field-reference'
import { elementIsLive } from './logic/html/element-is-live'
import { isHTMLElement } from './logic/html/is-html-element'
import { mergeElementWithField } from './logic/html/merge-element-with-field'
import { getValidationModes } from './logic/validation/get-validation-modes'
import { nativeValidateFields } from './logic/validation/native-validation'
import type { NativeValidationResult } from './logic/validation/native-validation/types'
import { shouldSkipValidationAfter } from './logic/validation/should-skip-validation-after'

import type { FieldErrors } from './types/errors'
import type { HTMLFieldElement, Field, FieldRecord } from './types/fields'
import type { ParseForm } from './types/parse'
import type { Resolver } from './types/resolver'

import type { DeepMap } from './utils/deep-map'
import type { DeepPartial } from './utils/deep-partial'
import type { Defaults } from './utils/defaults'
import type { KeysToProperties } from './utils/keys-to-properties'
import type { LiteralUnion } from './utils/literal-union'

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

export const defaultFormControlOptions: FormControlOptions = {
  /**
   * The form values are validated for the first time after submission.
   */
  mode: VALIDATION_EVENTS.onSubmit,

  /**
   * After the form values are validated for the first time, they're validated on every change.
   */
  reValidateMode: VALIDATION_EVENTS.onChange,

  /**
   * If an error is found during validation, the first field with an error is focused.
   */
  shouldFocusError: true,
}
