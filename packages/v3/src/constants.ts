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

export const INPUT_VALIDATION_RULES = {
  max: 'max',
  min: 'min',
  maxLength: 'maxLength',
  minLength: 'minLength',
  pattern: 'pattern',
  required: 'required',
  validate: 'validate',
} as const

export type InputValidationRules = typeof INPUT_VALIDATION_RULES

export type ValidationMode = typeof VALIDATION_MODE

export type RevalidationMode = typeof REVALIDATION_MODE

export type CriteriaMode = 'firstError' | 'all'

export type Mode = keyof ValidationMode
