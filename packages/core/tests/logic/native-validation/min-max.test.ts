import { describe, test, expect, vi } from 'vitest'

import type { Field } from '../../../src/logic/fields'
import {
  nativeValidateMinMax,
  fieldExceedsBounds,
} from '../../../src/logic/native-validation/min-max'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'

describe('nativeValidateMinMax', () => {
  const message = 'Hello, Aponia!'

  const defaultContext: NativeValidationContext = {
    field: {
      _f: {
        name: 'test',
        min: {
          value: 1,
          message,
        },
        max: {
          value: 10,
          message,
        },
        ref: {
          name: 'test',
        },
      },
    },
    errors: {},
    inputRef: document.createElement('input'),
    inputValue: 'test',
    formValues: {},
    shouldSetCustomValidity: true,
  }

  test('set custom validity is called', () => {
    const setCustomValidity = vi.fn()
    const reportValidity = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      inputValue: '1234567891011',
      inputRef: {
        setCustomValidity,
        reportValidity,
      } as any,
      shouldSetCustomValidity: true,
    }

    nativeValidateMinMax(context)

    expect(setCustomValidity).toHaveBeenCalledWith(message)
  })

  test('set custom validity is not called when validating all field criteria', () => {
    const setCustomValidity = vi.fn()
    const reportValidity = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      inputValue: '1234567891011',
      inputRef: {
        setCustomValidity,
        reportValidity,
      } as any,
      validateAllFieldCriteria: true,
      shouldSetCustomValidity: false,
    }

    nativeValidateMinMax(context)

    expect(setCustomValidity).not.toHaveBeenCalled()
  })
})

describe('fieldExceedsBounds', () => {
  test('works with 0', () => {
    const field: Field = {
      _f: {
        min: {
          value: 0,
          message: '',
        },
        max: {
          value: 10,
          message: '',
        },
        ref: {},
      },
    } as any

    const result = fieldExceedsBounds(field, 0)

    expect(result).toEqual({
      exceedMax: false,
      exceedMin: false,
      maxOutput: {
        message: '',
        value: 10,
      },
      minOutput: {
        message: '',
        value: 0,
      },
    })
  })
})
