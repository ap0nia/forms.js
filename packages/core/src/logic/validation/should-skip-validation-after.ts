import type { SubmissionValidationMode } from '../../constants'

/**
 * Whether to skip validation after some event.
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
