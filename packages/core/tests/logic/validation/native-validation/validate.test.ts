import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULES } from '../../../../src/constants'
import type { NativeValidationContext } from '../../../../src/logic/validation/native-validation/types'
import {
  nativeValidateValidate,
  parseValidationResult,
} from '../../../../src/logic/validation/native-validation/validate'
import type { FieldError, InternalFieldErrors } from '../../../../src/types/errors'
import { noop } from '../../../../src/utils/noop'

describe('nativeValidateValidate', () => {
  test('no errors if no constraints', async () => {
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

    await nativeValidateValidate(context, noop)

    const expectedErrors: InternalFieldErrors = {}

    expect(context.errors).toEqual(expectedErrors)
  })

  test('calls setCustomValidity for validation function', async () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          validate: () => '',
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: '',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    await nativeValidateValidate(context, noop)

    const expectedErrors: InternalFieldErrors = {
      [ref.name]: {
        type: 'validate',
        message: '',
        ref,
      },
    }

    expect(context.errors).toEqual(expectedErrors)

    expect(ref.setCustomValidity).toHaveBeenCalledWith('')
  })

  test('calls setCustomValidity for validation record', async () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          validate: {
            [ref.name]: () => '',
          },
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: '',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    await nativeValidateValidate(context, noop)

    const expectedErrors: InternalFieldErrors = {
      [ref.name]: {
        type: ref.name,
        message: '',
        ref,
      },
    }

    expect(context.errors).toEqual(expectedErrors)

    expect(ref.setCustomValidity).toHaveBeenCalledWith('')
  })

  test('correctly sets errors for validation function', async () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          validate: () => '',
        },
      },
      errors: {
        /**
         * This covers the optional chaining for existing errors at the same field name.
         */
        [ref.name]: {
          type: 'validate',
        },
      },
      inputRef: ref,
      inputValue: '',
      formValues: {},
      validateAllFieldCriteria: true,
    }

    await nativeValidateValidate(context, noop)

    const expectedErrors: InternalFieldErrors = {
      [ref.name]: {
        type: 'validate',
        message: '',
        ref,
        types: {
          [INPUT_VALIDATION_RULES.validate]: true,
        },
      },
    }

    expect(context.errors).toEqual(expectedErrors)
  })

  test('correctly sets errors for validation record validate all', async () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          validate: {
            [ref.name]: () => '',
          },
        },
      },
      errors: {
        /**
         * This covers the optional chaining for existing errors at the same field name.
         */
        [ref.name]: {
          type: 'validate',
        },
      },
      inputRef: ref,
      inputValue: '',
      formValues: {},
      validateAllFieldCriteria: true,
    }

    await nativeValidateValidate(context, noop)

    const expectedErrors: InternalFieldErrors = {
      [ref.name]: {
        type: 'validate',
        message: '',
        ref,
        types: {
          [ref.name]: true,
        },
      },
    }

    expect(context.errors).toEqual(expectedErrors)
  })

  test('correctly sets errors for validation record validate all', async () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          validate: {
            [ref.name]: () => '',
          },
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: '',
      formValues: {},
      validateAllFieldCriteria: true,
    }

    await nativeValidateValidate(context, noop)

    const expectedErrors: InternalFieldErrors = {
      [ref.name]: {
        type: ref.name,
        message: '',
        ref,
        types: {
          [ref.name]: true,
        },
      },
    }

    expect(context.errors).toEqual(expectedErrors)
  })
})

describe('parseValidationResult', () => {
  test('string result', () => {
    const ref = document.createElement('input')

    const result = parseValidationResult('error', ref)

    const expectedResult: FieldError = { type: 'validate', message: 'error', ref }

    expect(result).toEqual(expectedResult)
  })

  test('string array result', () => {
    const ref = document.createElement('input')

    const result = parseValidationResult(['error1', 'error2'], ref)

    const expectedResult: FieldError = { type: 'validate', message: '', ref }

    expect(result).toEqual(expectedResult)
  })

  test('false result', () => {
    const ref = document.createElement('input')

    const result = parseValidationResult(false, ref)

    const expectedResult: FieldError = { type: 'validate', message: '', ref }

    expect(result).toEqual(expectedResult)
  })
})
