import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULES } from '../../../src/constants'
import { nativeValidatePattern } from '../../../src/logic/native-validation/pattern'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'
import { noop } from '../../../src/utils/noop'

describe('nativeValidatePattern', () => {
  const defaultContext: NativeValidationContext = {
    field: {
      _f: {
        name: 'test',
        pattern: /validTestValue/,
        ref: {
          name: 'test',
        },
      },
    },
    errors: {},
    inputRef: document.createElement('input'),
    inputValue: 'invalid test value',
    formValues: {},
    shouldSetCustomValidity: true,
  }

  test('does not mutate errors if no pattern', () => {
    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          ref: {
            name: 'test',
          },
        },
      },
      inputRef: document.createElement('input'),
      formValues: {},
      errors: {},
      inputValue: '',
      shouldSetCustomValidity: true,
    }

    nativeValidatePattern(context, noop)

    expect(context.errors).toEqual({})
  })

  test('does not mutate errors if string matches pattern', () => {
    const value = 'validTestValue'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          pattern: new RegExp(value),
          ref: {
            name: 'test',
            value,
          },
        },
      },
      inputRef: document.createElement('input'),
      formValues: {},
      errors: {},
      inputValue: value,
      shouldSetCustomValidity: true,
    }

    nativeValidatePattern(context, noop)

    expect(context.errors).toEqual({})
  })

  test('invalid string sets error', () => {
    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          pattern: /validTestValue/,
          ref: {
            name: 'test',
            value: '',
          },
        },
      },
      inputRef: document.createElement('input'),
      formValues: {},
      errors: {
        test: {
          type: 'pattern',
        },
      },
      inputValue: 'invalid test value',
      shouldSetCustomValidity: true,
      validateAllFieldCriteria: true,
    }

    nativeValidatePattern(context, noop)

    expect(context.errors).toEqual({
      test: {
        type: INPUT_VALIDATION_RULES.pattern,
        message: '',
        ref: {
          name: 'test',
          value: '',
        },
        types: {
          [INPUT_VALIDATION_RULES.pattern]: true,
        },
      },
    })
  })

  test('set custom validity is called', () => {
    const setCustomValidity = vi.fn()
    const reportValidity = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      inputRef: {
        setCustomValidity,
        reportValidity,
      } as any,
      shouldSetCustomValidity: true,
    }

    nativeValidatePattern(context, noop)

    expect(setCustomValidity).toHaveBeenCalledOnce()
  })
})
