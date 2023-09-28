import { describe, test, expect } from 'vitest'

import type { ValidateOnEvent } from '../../../src/constants'
import { getValidationModes } from '../../../src/logic/validation/get-validation-modes'

describe('getValidationModes', () => {
  test('onSubmit', () => {
    const expectedResult: ValidateOnEvent = {
      submit: true,
      blur: false,
      change: false,
      all: false,
      touch: false,
    }

    expect(getValidationModes('onSubmit')).toEqual(expectedResult)
  })
})
