import type {
  SubmissionValidationMode,
  RevalidationModeFlags,
  ValidationModeFlags,
} from '../../constants'

/**
 * Whether to skip validation after some event.
 *
 * @param submissionValidationMode simpler, all-in-one interface for representing (re) validation mode details.
 */
export function shouldSkipValidationAfter(
  eventType: 'blur' | 'change',
  isTouched?: boolean,
  isSubmitted?: boolean,
  submissionValidationMode?: SubmissionValidationMode,
): boolean {
  const isBlurEvent = eventType === 'blur'

  const revalidationMode: RevalidationModeFlags = {
    isOnBlur: Boolean(submissionValidationMode?.afterSubmission.onBlur),
    isOnChange: Boolean(submissionValidationMode?.afterSubmission.onChange),
  }

  const validationMode: ValidationModeFlags = {
    isOnChange: Boolean(submissionValidationMode?.beforeSubmission.onChange),
    isOnBlur: Boolean(submissionValidationMode?.beforeSubmission.onBlur),
    isOnAll: Boolean(submissionValidationMode?.beforeSubmission.all),
    isOnTouch: Boolean(submissionValidationMode?.beforeSubmission.onTouched),
    isOnSubmit: Boolean(submissionValidationMode?.beforeSubmission.onSubmit),
  }

  return skipValidation(isBlurEvent, isTouched, isSubmitted, revalidationMode, validationMode)
}

/**
 * Original function signature.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/1d0503b46cfe0589b188c4c0d9fa75f247271cf7/src/logic/skipValidation.ts
 */
export function skipValidation(
  isBlurEvent?: boolean,
  isTouched?: boolean,
  isSubmitted?: boolean,
  revalidationMode?: Partial<RevalidationModeFlags>,
  validationMode?: Partial<ValidationModeFlags>,
): boolean {
  if (validationMode?.isOnAll) {
    return false
  }

  const validateOnTouchEvents = !isSubmitted && validationMode?.isOnTouch

  if (validateOnTouchEvents) {
    return !(isTouched || isBlurEvent)
  }

  const validateOnBlurEvents = isSubmitted ? revalidationMode?.isOnBlur : validationMode?.isOnBlur

  if (validateOnBlurEvents) {
    return !isBlurEvent
  }

  const validateOnChangeEvents = isSubmitted
    ? revalidationMode?.isOnChange
    : validationMode?.isOnChange

  if (validateOnChangeEvents) {
    return Boolean(isBlurEvent)
  }

  return true
}
