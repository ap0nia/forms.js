import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULES } from '../../../src/constants'
import { nativeValidateMinMaxLength } from '../../../src/logic/native-validation/min-max-length'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'
import { noop } from '../../../src/utils/noop'

describe('nativeValidateMinMaxLength', () => {
  test('no errors if no constraints', () => {
    const ref = document.createElement('input')

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          ref,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 'test',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateMinMaxLength(context, noop)

    expect(context.errors).toEqual({})
  })

  test('no errors if inside bounds', () => {
    const ref = document.createElement('input')

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          ref,
          minLength: 1,
          maxLength: 10,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 'test',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateMinMaxLength(context, noop)

    expect(context.errors).toEqual({})
  })

  test('calls setCustomValidity if maxLength exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          ref,
          maxLength: 1,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 'test',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateMinMaxLength(context, noop)

    expect(context.errors).toEqual({
      test: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULES.maxLength,
        message: '',
      },
    })

    expect(ref.setCustomValidity).toHaveBeenCalledWith('')
  })

  test('calls setCustomValidity if minLength exceeded', () => {
    const ref = document.createElement('input')

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          ref,
          minLength: 10,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 'test',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateMinMaxLength(context, noop)

    expect(context.errors).toEqual({
      test: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULES.minLength,
        message: '',
      },
    })

    expect(ref.setCustomValidity).toHaveBeenCalledWith('')
  })

  test('correct errors when maxLength exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          ref,
          maxLength: 1,
        },
      },
      errors: {
        /**
         * This covers the optional chaining for existing errors at the same field name.
         */
        [ref.name]: {
          type: 'maxLength',
        },
      },
      inputRef: ref,
      inputValue: 'test',
      formValues: {},
      validateAllFieldCriteria: true,
    }

    nativeValidateMinMaxLength(context, noop)

    expect(context.errors).toEqual({
      test: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULES.maxLength,
        message: '',
        types: {
          [INPUT_VALIDATION_RULES.maxLength]: true,
        },
      },
    })
  })

  test('correct errors when minLength exceeded', () => {
    const ref = document.createElement('input')

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          ref,
          minLength: 10,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 'test',
      formValues: {},
      validateAllFieldCriteria: true,
    }

    nativeValidateMinMaxLength(context, noop)

    expect(context.errors).toEqual({
      test: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULES.minLength,
        message: '',
        types: {
          [INPUT_VALIDATION_RULES.minLength]: true,
        },
      },
    })
  })

  test('no errors for array length within bounds', () => {
    const ref = document.createElement('input')

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
          ref,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: [],
      formValues: {},
      shouldSetCustomValidity: true,
      isFieldArray: true,
    }

    nativeValidateMinMaxLength(context, noop)

    expect(context.errors).toEqual({})
  })
})
