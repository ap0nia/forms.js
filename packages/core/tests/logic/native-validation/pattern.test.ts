import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULES } from '../../../src/constants'
import { nativeValidatePattern } from '../../../src/logic/native-validation/pattern'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'
import { noop } from '../../../src/utils/noop'

describe('nativeValidatePattern', () => {
  test('no errors if no constraints', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 'test',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidatePattern(context, noop)

    expect(context.errors).toEqual({})
  })

  test('no errors if pattern matches', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const inputValue = 'valid-value'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          pattern: new RegExp(inputValue),
        },
      },
      errors: {},
      inputRef: ref,
      inputValue,
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidatePattern(context, noop)

    expect(context.errors).toEqual({})
  })

  test('calls setCustomValidity if pattern does not match', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          pattern: new RegExp('valid-value'),
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 'Hello, World!',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidatePattern(context, noop)

    expect(context.errors).toEqual({
      test: {
        type: INPUT_VALIDATION_RULES.pattern,
        message: '',
        ref,
      },
    })

    expect(ref.setCustomValidity).toHaveBeenCalledWith('')
  })

  test('correctly sets errors when pattern does not match', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          pattern: new RegExp('valid-value'),
        },
      },
      errors: {
        /**
         * This covers the optional chaining for existing errors at the same field name.
         */
        [ref.name]: {
          type: 'pattern',
        },
      },
      inputRef: ref,
      inputValue: 'Hello, World!',
      formValues: {},
      validateAllFieldCriteria: true,
    }

    nativeValidatePattern(context, noop)

    expect(context.errors).toEqual({
      test: {
        type: INPUT_VALIDATION_RULES.pattern,
        message: '',
        ref,
        types: {
          [INPUT_VALIDATION_RULES.pattern]: true,
        },
      },
    })
  })
})
