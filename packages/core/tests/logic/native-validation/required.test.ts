import { describe, test, expect, vi } from 'vitest'

import type { Field } from '../../../src/logic/fields'
import {
  nativeValidateRequired,
  requiredButMissing,
} from '../../../src/logic/native-validation/required'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'

describe('requiredButMissing', () => {
  const ref = document.createElement('input')
  ref.type = 'checkbox'

  const field: Field = {
    _f: {
      name: 'test',
      ref,
      required: true,
    },
  }

  test('should return true if required and not checked', () => {
    expect(requiredButMissing(field, 'fake value', false)).toBeTruthy()
  })
})

describe('nativeValidateRequired', () => {
  test('validate all field criteria', () => {
    const next = vi.fn()

    const inputRef = document.createElement('input')
    inputRef.type = 'checkbox'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          required: true,
          ref: inputRef,
        },
      },
      errors: {
        test: {
          type: 'required',
        },
      },
      inputRef,
      inputValue: 'test',
      formValues: {},
      shouldSetCustomValidity: true,
      validateAllFieldCriteria: true,
    }

    expect(requiredButMissing(context.field, context.inputValue, false)).toBeTruthy()

    nativeValidateRequired(context, next)

    expect(next).toHaveBeenCalledOnce()
  })
})
