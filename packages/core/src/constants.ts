/**
 * Recognized input events.
 */
export const INPUT_EVENTS = {
  BLUR: 'blur',
  FOCUS_OUT: 'focusout',
  CHANGE: 'change',
} as const

/**
 * Supported native validation constraints.
 */
export const INPUT_VALIDATION_RULE = {
  max: 'max',
  min: 'min',
  maxLength: 'maxLength',
  minLength: 'minLength',
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
 * When to validate the form data.
 */
export type FormValidationMode = {
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

export type RevalidationEvent = typeof REVALIDATION_EVENTS

export type ValidationEvent = typeof VALIDATION_EVENTS

export type CriteriaMode = typeof CRITERIA_MODE

export type ValidationMode = { [K in keyof ValidationEvent]: boolean }
