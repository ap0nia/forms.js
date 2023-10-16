import { describe, test, expect } from 'vitest'

import { hasValidation } from '../../../src/logic/fields/has-validation'
import type { FieldReference } from '../../../src/types/fields'

describe('hasValidation', () => {
  test('returns false if mount is false', () => {
    const fieldReference: FieldReference = {
      mount: false,
      name: 'test',
      ref: {
        name: 'test',
      },
    }

    expect(hasValidation(fieldReference)).toBeFalsy()
  })

  test('returns false if no validation props are present', () => {
    const fieldReference: FieldReference = {
      mount: true,
      name: 'test',
      ref: {
        name: 'test',
      },
    }

    expect(hasValidation(fieldReference)).toBeFalsy()
  })

  test('returns true if any one of validation props are present', () => {
    const fieldReference: FieldReference = {
      mount: true,
      name: 'test',
      ref: {
        name: 'test',
      },
      required: true,
    }

    expect(hasValidation(fieldReference)).toBeTruthy()

    fieldReference.required = false
    fieldReference.min = 1

    expect(hasValidation(fieldReference)).toBeTruthy()

    fieldReference.min = undefined
    fieldReference.max = 1

    expect(hasValidation(fieldReference)).toBeTruthy()

    fieldReference.max = undefined
    fieldReference.maxLength = 1

    expect(hasValidation(fieldReference)).toBeTruthy()

    fieldReference.maxLength = undefined
    fieldReference.minLength = 1

    expect(hasValidation(fieldReference)).toBeTruthy()

    fieldReference.minLength = undefined
    fieldReference.pattern = /test/

    expect(hasValidation(fieldReference)).toBeTruthy()

    fieldReference.pattern = undefined
    fieldReference.validate = () => true

    expect(hasValidation(fieldReference)).toBeTruthy()

    fieldReference.validate = undefined

    // All validations should be unset at this point.
    expect(hasValidation(fieldReference)).toBeFalsy()
  })
})
