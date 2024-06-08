import type {
  SubmissionValidationMode,
  RevalidationModeFlags,
  ValidationModeFlags,
} from '../../constants'

/**
 * Whether to skip validation after some event.
 *
 * @see https://github.com/react-hook-form/react-hook-form/blob/1d0503b46cfe0589b188c4c0d9fa75f247271cf7/src/logic/skipValidation.ts
 */
export function shouldSkipValidationAfter(
  eventType: 'blur' | 'change',
  isTouched?: boolean,
  isSubmitted?: boolean,
  submissionValidationMode?: SubmissionValidationMode,
): boolean {
  const { beforeSubmission, afterSubmission } = submissionValidationMode ?? {}

  const validateOnAllEvents = beforeSubmission?.all

  if (validateOnAllEvents) {
    return false
  }

  const validateOnTouchEvents = !isSubmitted && beforeSubmission?.onTouched

  if (validateOnTouchEvents) {
    return !(isTouched || eventType === 'blur')
  }

  const validateOnBlurEvents = isSubmitted ? afterSubmission?.onBlur : beforeSubmission?.onBlur

  if (validateOnBlurEvents) {
    return eventType !== 'blur'
  }

  const validateOnChangeEvents = isSubmitted
    ? afterSubmission?.onChange
    : beforeSubmission?.onChange

  if (validateOnChangeEvents) {
    return eventType !== 'change'
  }

  return true
}

/**
 * react-hook-form compatible version of this function.
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
