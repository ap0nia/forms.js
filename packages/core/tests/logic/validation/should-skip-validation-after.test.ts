import { describe, it, test, expect } from 'vitest'

import type { SubmissionValidationMode } from '../../..//src/constants'
import {
  shouldSkipValidationAfter,
  skipValidation,
} from '../../../src/logic/validation/should-skip-validation-after'

describe('shouldSkipValidationAfter', () => {
  test('returns false if validating on all events', () => {
    const eventType = 'blur'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
      beforeSubmission: {
        // Validate on all events before submission.
        all: true,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeFalsy()
  })

  test('returns true if validating on touch events and neither touched or blur event', () => {
    // Not a blur event.
    const eventType = 'change'

    // Not touched.
    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
      beforeSubmission: {
        all: false,

        // Validate on touch events.
        onTouched: true,

        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeTruthy()
  })

  test('returns false if validating on touch events either touched or blur event', () => {
    // Not a blur event.
    let eventType: 'blur' | 'change' = 'change'

    // Touched.
    let isTouched = true

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
      beforeSubmission: {
        all: false,

        // Validate on touch events.
        onTouched: true,

        onBlur: false,
        onChange: false,
        onSubmit: false,
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

  test('returns true validating on blur events and not a blur event', () => {
    // Not a blur event.
    const eventType = 'change'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
      beforeSubmission: {
        all: false,
        onTouched: false,

        // Validate on blur events.
        onBlur: true,

        onChange: false,
        onSubmit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeTruthy()
  })

  test('returns false if validating on blur events and a blur event', () => {
    // Blur event.
    const eventType = 'blur'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
      beforeSubmission: {
        all: false,
        onTouched: false,

        // Validate on blur events.
        onBlur: true,

        onChange: false,
        onSubmit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeFalsy()
  })

  test('returns true if validating on change events and not a change event', () => {
    // Not a change event.
    const eventType = 'blur'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
      beforeSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,

        // Validate on change events.
        onChange: true,

        onSubmit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeTruthy()
  })

  test('returns false if validating on change events and a change event', () => {
    // Change event.
    const eventType = 'change'

    const isTouched = false

    let isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,

        // Validate on change events after submission.
        onChange: true,

        onSubmit: false,
      },
      beforeSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,

        // Validate on change events before submission.
        onChange: true,

        onSubmit: false,
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

  test('returns true if everything is false', () => {
    const eventType = 'blur'

    const isTouched = false

    const isSubmitted = false

    const submissionValidationMode: SubmissionValidationMode = {
      afterSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
      beforeSubmission: {
        all: false,
        onTouched: false,
        onBlur: false,
        onChange: false,
        onSubmit: false,
      },
    }

    expect(
      shouldSkipValidationAfter(eventType, isTouched, isSubmitted, submissionValidationMode),
    ).toBeTruthy()
  })

  test('returns true if nothing is defined', () => {
    expect(shouldSkipValidationAfter('blur')).toBeTruthy()
    expect(shouldSkipValidationAfter('change')).toBeTruthy()
  })
})

describe('react-hook-form', () => {
  describe('should skip validation', () => {
    it('when is onChange mode and blur event', () => {
      expect(
        skipValidation(
          false,
          false,
          false,
          {
            isOnChange: true,
            isOnBlur: false,
          },
          {
            isOnChange: true,
            isOnBlur: true,
            isOnTouch: false,
          },
        ),
      ).toBeTruthy()
    })

    it('when is onSubmit mode and re-validate on Submit', () => {
      expect(
        skipValidation(
          false,
          false,
          false,
          {
            isOnChange: false,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: false,
            isOnTouch: false,
          },
        ),
      ).toBeTruthy()
    })

    it('when is onSubmit mode and not submitted yet', () => {
      expect(
        skipValidation(
          false,
          false,
          false,
          {
            isOnChange: true,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: false,
            isOnTouch: false,
          },
        ),
      ).toBeTruthy()
    })

    it('when on blur mode, not blur event and error gets clear', () => {
      expect(
        skipValidation(
          false,
          false,
          false,
          {
            isOnChange: true,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: true,
            isOnTouch: false,
          },
        ),
      ).toBeTruthy()
    })

    it('when re-validate mode is blur, not blur event and has error ', () => {
      expect(
        skipValidation(
          false,
          false,
          true,
          {
            isOnChange: true,
            isOnBlur: true,
          },
          {
            isOnChange: false,
            isOnBlur: false,
            isOnTouch: false,
          },
        ),
      ).toBeTruthy()
    })

    it('when is re-validate mode on submit and have error', () => {
      expect(
        skipValidation(
          false,
          false,
          true,
          {
            isOnChange: false,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: false,
            isOnTouch: false,
          },
        ),
      ).toBeTruthy()
    })
  })

  describe('should validate the input', () => {
    it('when form is submitted and there is error', () => {
      expect(
        skipValidation(
          false,
          false,
          true,
          {
            isOnChange: true,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: false,
            isOnTouch: false,
          },
        ),
      ).toBeFalsy()
    })

    it('when mode is under all', () => {
      expect(
        skipValidation(
          false,
          false,
          false,
          {
            isOnChange: false,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: false,
            isOnAll: true,
          },
        ),
      ).toBeFalsy()
    })

    it('when not submitted, not blurred, but is touched and mode is on touch', () => {
      expect(
        skipValidation(
          false,
          true,
          false,
          {
            isOnChange: false,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: false,
            isOnAll: false,
            isOnTouch: true,
          },
        ),
      ).toBeFalsy()
    })

    it('when not submitted, not touched, but is blurred and mode is on touch', () => {
      expect(
        skipValidation(
          true,
          false,
          false,
          {
            isOnChange: false,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: false,
            isOnAll: false,
            isOnTouch: true,
          },
        ),
      ).toBeFalsy()
    })

    it('when user blur input and there is no more error', () => {
      expect(
        skipValidation(
          true,
          false,
          false,
          {
            isOnChange: true,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: true,
            isOnTouch: false,
          },
        ),
      ).toBeFalsy()
    })

    it('when user blur and there is an error', () => {
      expect(
        skipValidation(
          true,
          false,
          false,
          {
            isOnChange: true,
            isOnBlur: false,
          },
          {
            isOnChange: false,
            isOnBlur: true,
            isOnTouch: false,
          },
        ),
      ).toBeFalsy()
    })
  })
})
