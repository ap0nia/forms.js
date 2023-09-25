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

  const validateOnTouchEvents = !isSubmitted && beforeSubmission?.touch

  if (validateOnTouchEvents) {
    return !(isTouched || eventType === 'blur')
  }

  const validateOnBlurEvents = isSubmitted ? afterSubmission?.blur : beforeSubmission?.blur

  if (validateOnBlurEvents) {
    return eventType !== 'blur'
  }

  const validateOnChangeEvents = isSubmitted ? afterSubmission?.change : beforeSubmission?.change

  if (validateOnChangeEvents) {
    return eventType !== 'change'
  }

  return true
}
