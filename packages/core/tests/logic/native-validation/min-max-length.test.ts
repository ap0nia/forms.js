import { describe, test, expect, vi } from 'vitest'

import { nativeValidateMinMaxLength } from '../../../src/logic/native-validation/min-max-length'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'

describe('nativeValidateMinMaxLength', () => {
  const defaultContext: NativeValidationContext = {
    field: {
      _f: {
        name: 'test',
        minLength: {
          value: 1,
          message: '',
        },
        maxLength: {
          value: 10,
          message: '',
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

  test('should return next if input is empty', () => {
    const next = vi.fn()

    const context = { ...defaultContext, inputValue: '' }

    nativeValidateMinMaxLength(context, next)
    expect(next).toHaveBeenCalledOnce()
  })

  test('should return next if neither bounds are exceeded', () => {
    const next = vi.fn()

    const context = { ...defaultContext, inputValue: 'test' }

    nativeValidateMinMaxLength(context, next)

    expect(next).toHaveBeenCalledOnce()
  })

  test('next is not called if not validating all field criteria', () => {
    const next = vi.fn()

    const context = {
      ...defaultContext,
      inputValue: 'test',
      field: {
        ...defaultContext.field,
        _f: {
          ...defaultContext.field._f,
          minLength: {
            value: 10,
            message: '',
          },
        },
      },
    }

    nativeValidateMinMaxLength(context, next)

    expect(next).not.toHaveBeenCalled()
  })

  test('should not set custom validity if validating all field criteria', () => {
    const next = vi.fn()

    const context = {
      ...defaultContext,
      inputValue: 'test',
      field: {
        ...defaultContext.field,
        _f: {
          ...defaultContext.field._f,
          minLength: {
            value: 10,
            message: '',
          },
        },
      },
      shouldSetCustomValidity: false,
      validateAllFieldCriteria: true,
    }

    nativeValidateMinMaxLength(context, next)

    expect(next).toHaveBeenCalledOnce()
  })
})
