import { describe, test, expect } from 'vitest'

import type { SubmissionValidationMode } from '../../..//src/constants'
import { shouldSkipValidationAfter } from '../../../src/logic/validation/should-skip-validation-after'

describe('shouldSkipValidationAfter', () => {
  test('false if validating on all events', () => {
    const eventType = 'blur'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
      beforeSubmission: {
        // Validate on all events before submission.
        all: true,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeFalsy()
  })

  test('skip if validating on touch events and neither touched or blur event', () => {
    // Not a blur event.
    const eventType = 'change'

    // Not touched.
    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
      beforeSubmission: {
        all: false,

        // Validate on touch events.
        touch: true,

        blur: false,
        change: false,
        submit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeTruthy()
  })

  test('do not skip if validating on touch events either touched or blur event', () => {
    // Not a blur event.
    let eventType: 'blur' | 'change' = 'change'

    // Touched.
    let isTouched = true

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
      beforeSubmission: {
        all: false,

        // Validate on touch events.
        touch: true,

        blur: false,
        change: false,
        submit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeFalsy()

    // Blur event.
    eventType = 'blur'

    // Not touched.
    isTouched = false

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeFalsy()
  })

  test('skip if validating on blur events and not a blur event', () => {
    // Not a blur event.
    const eventType = 'change'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
      beforeSubmission: {
        all: false,
        touch: false,

        // Validate on blur events.
        blur: true,

        change: false,
        submit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeTruthy()
  })

  test('do not skip if validating on blur events and a blur event', () => {
    // Blur event.
    const eventType = 'blur'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
      beforeSubmission: {
        all: false,
        touch: false,

        // Validate on blur events.
        blur: true,

        change: false,
        submit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeFalsy()
  })

  test('skip if validating on change events and not a change event', () => {
    // Not a change event.
    const eventType = 'blur'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
      beforeSubmission: {
        all: false,
        touch: false,
        blur: false,

        // Validate on change events.
        change: true,

        submit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeTruthy()
  })

  test('do not skip if validating on change events and a change event', () => {
    // Change event.
    const eventType = 'change'

    const isTouched = false

    let isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        touch: false,
        blur: false,

        // Validate on change events after submission.
        change: true,

        submit: false,
      },
      beforeSubmission: {
        all: false,
        touch: false,
        blur: false,

        // Validate on change events before submission.
        change: true,

        submit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeFalsy()

    // Submitted.
    isSubmitted = true

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeFalsy()
  })

  test('skip if everything is false lol', () => {
    const eventType = 'blur'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
      beforeSubmission: {
        all: false,
        touch: false,
        blur: false,
        change: false,
        submit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeTruthy()
  })

  test('skip if nothing is defined', () => {
    expect(shouldSkipValidationAfter('blur')).toBeTruthy()
    expect(shouldSkipValidationAfter('change')).toBeTruthy()
  })
})