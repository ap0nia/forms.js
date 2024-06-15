import { describe, test, expect } from 'vitest'

import type { ValidationMode } from '../../../src/constants'
import { getValidationModes } from '../../../src/logic/validation/get-validation-modes'

describe('getValidationMode', () => {
  test('onSubmit', () => {
    const expectedResult: ValidationMode = {
      onSubmit: true,
      onBlur: false,
      onChange: false,
      all: false,
      onTouched: false,
    }

    expect(getValidationModes('onSubmit')).toEqual(expectedResult)
  })
})
