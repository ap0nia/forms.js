export const EVENTS = {
  BLUR: 'blur',
  FOCUS_OUT: 'focusout',
  CHANGE: 'change',
} as const

export const REVALIDATION_MODE = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
} as const

export const VALIDATION_MODE = {
  ...REVALIDATION_MODE,
  onTouched: 'onTouched',
  all: 'all',
} as const

export const INPUT_VALIDATION_RULE = {
  max: 'max',
  min: 'min',
  maxLength: 'maxLength',
  minLength: 'minLength',
  pattern: 'pattern',
  required: 'required',
  validate: 'validate',
} as const

export const CRITERIA_MODE = {
  firstError: 'firstError',
  all: 'all',
}

export const STAGE = {
  IDLE: 'idle',
  ACTION: 'action',
  MOUNT: 'mount',
  WATCH: 'watch',
} as const

export type InputValidationRule = typeof INPUT_VALIDATION_RULE

export type ValidationMode = typeof VALIDATION_MODE

export type RevalidationMode = typeof REVALIDATION_MODE

export type CriteriaMode = typeof CRITERIA_MODE

export type Stage = typeof STAGE

/**
 * How to validate before/after submission.
 */
export type SubmissionValidationMode = {
  /**
   * When to validate prior to submitting a form.
   */
  beforeSubmission: ValidateOnEvent

  /**
   * When to validate after submitting a form.
   */
  afterSubmission: ValidateOnEvent
}

/**
 * When to validate based on (mostly DOM-oriented) events.
 */
export type ValidateOnEvent = {
  /**
   * Whether to validate on all events (i.e. indiscriminately).
   */
  all: boolean

  /**
   * Whether to validate on a touch event.
   */
  touch: boolean

  /**
   * Whether to validate on a blur event.
   */
  blur: boolean

  /**
   * Whether to validate on a change event.
   */
  change: boolean

  /**
   * Whether to validate on a submission event.
   */
  submit: boolean
}

/**
 * Helper.
 */
export function getValidationModes(
  mode?: ValidationMode[keyof ValidationMode] | RevalidationMode[keyof RevalidationMode],
): ValidateOnEvent {
  return {
    submit: !mode || mode === VALIDATION_MODE.onSubmit,
    blur: mode === VALIDATION_MODE.onBlur,
    change: mode === VALIDATION_MODE.onChange,
    all: mode === VALIDATION_MODE.all,
    touch: mode === VALIDATION_MODE.onTouched,
  }
}
