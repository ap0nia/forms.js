import { describe, test, expect, vi } from 'vitest'

import type { NativeValidationContext } from '../../../src/logic/native-validation/types'
import { nativeValidateValidate } from '../../../src/logic/native-validation/validate'

describe('nativeValidateValidate', () => {
  const defaultContext: NativeValidationContext = {
    field: {
      _f: {
        name: 'test',
        validate: vi.fn(),
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

  test('validate is called', async () => {
    const validate = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      field: {
        _f: {
          ...defaultContext.field._f,
          validate,
        },
      },
    }

    await nativeValidateValidate(context)

    expect(validate).toHaveBeenCalledWith(context.inputValue, context.formValues)
  })

  test('set custom validity is called', async () => {
    const setCustomValidity = vi.fn()
    const reportValidity = vi.fn()

    const errorMessage = 'error!'

    const context: NativeValidationContext = {
      ...defaultContext,
      field: {
        _f: {
          ...defaultContext.field._f,
          validate: () => errorMessage,
        },
      },
      inputValue: '1234567891011',
      inputRef: {
        setCustomValidity,
        reportValidity,
      } as any,
      shouldSetCustomValidity: true,
    }

    await nativeValidateValidate(context)

    expect(setCustomValidity).toHaveBeenCalledWith(errorMessage)
  })

  test('set custom validity is called', async () => {
    const setCustomValidity = vi.fn()
    const reportValidity = vi.fn()

    const errorMessage = 'error!'

    const context: NativeValidationContext = {
      ...defaultContext,
      field: {
        _f: {
          ...defaultContext.field._f,
          validate: {
            test: () => errorMessage,
          },
        },
      },
      inputValue: '1234567891011',
      inputRef: {
        setCustomValidity,
        reportValidity,
      } as any,
      shouldSetCustomValidity: true,
    }

    await nativeValidateValidate(context)

    expect(setCustomValidity).toHaveBeenCalledWith(errorMessage)
  })
})
