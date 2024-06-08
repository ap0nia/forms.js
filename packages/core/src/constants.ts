/**
 * Recognized input events.
 */
export const INPUT_EVENTS = {
  BLUR: 'blur',
  FOCUS_OUT: 'focusout',
  CHANGE: 'change',
} as const

export const MAX_INPUT_VALIDATION_RULE = {
  max: 'max',
  maxLength: 'maxLength',
} as const

export const MIN_INPUT_VALIDATION_RULE = {
  min: 'min',
  minLength: 'minLength',
} as const

/**
 * Supported native validation constraints.
 */
export const INPUT_VALIDATION_RULE = {
  ...MAX_INPUT_VALIDATION_RULE,
  ...MIN_INPUT_VALIDATION_RULE,
  pattern: 'pattern',
  required: 'required',
  validate: 'validate',
} as const

/**
 * When the form will re-validate its data.
 */
export const REVALIDATION_EVENTS = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
} as const

/**
 * When the form will validate its data.
 */
export const VALIDATION_EVENTS = {
  ...REVALIDATION_EVENTS,
  onTouched: 'onTouched',
  all: 'all',
} as const

/**
 * When to stop validating.
 */
export const CRITERIA_MODE = {
  /**
   * Stop validating after the first error is found.
   */
  firstError: 'firstError',

  /**
   * Continue validating until all errors have been found.
   */
  all: 'all',
}

/**
 * When to validate the form data based on the submission status.
 */
export type SubmissionValidationMode = {
  /**
   * When to validate prior to submitting a form.
   */
  beforeSubmission: { [K in keyof ValidationEvent]: boolean }

  /**
   * When to validate after submitting a form.
   */
  afterSubmission: { [K in keyof ValidationEvent]: boolean }
}

export type InputEvent = typeof INPUT_EVENTS

export type InputValidationRule = typeof INPUT_VALIDATION_RULE

export type MaxInputValidationRule = typeof MAX_INPUT_VALIDATION_RULE

export type MinInputValidationRule = typeof MIN_INPUT_VALIDATION_RULE

export type RevalidationEvent = typeof REVALIDATION_EVENTS

export type ValidationEvent = typeof VALIDATION_EVENTS

export type CriteriaMode = typeof CRITERIA_MODE

export type ValidationMode = { [K in keyof ValidationEvent]: boolean }

export type RevalidationMode = { [K in keyof RevalidationEvent]: boolean }
