import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULE } from '../../../../src/constants'
import { nativeValidateMinMaxLength } from '../../../../src/logic/validation/native-validation/min-max-length'
import type { NativeValidationContext } from '../../../../src/logic/validation/native-validation/types'
import type { FieldErrorRecord } from '../../../../src/types/errors'
import { noop } from '../../../../src/utils/noop'

describe('nativeValidateMinMaxLength', () => {
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

    nativeValidateMinMaxLength(context, noop)

    const expectedErrors: FieldErrorRecord = {}

    expect(context.errors).toEqual(expectedErrors)
  })

  test('no errors if inside bounds', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
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

    const expectedErrors: FieldErrorRecord = {}

    expect(context.errors).toEqual(expectedErrors)
  })

  test('calls setCustomValidity if maxLength exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
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

    const expectedErrors: FieldErrorRecord = {
      [ref.name]: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULE.maxLength,
        message: '',
      },
    }

    expect(context.errors).toEqual(expectedErrors)

    expect(ref.setCustomValidity).toHaveBeenCalledWith(expectedErrors[ref.name]?.message)
  })

  test('calls setCustomValidity if minLength exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
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

    const expectedErrors: FieldErrorRecord = {
      [ref.name]: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULE.minLength,
        message: '',
      },
    }

    expect(context.errors).toEqual(expectedErrors)

    expect(ref.setCustomValidity).toHaveBeenCalledWith(expectedErrors[ref.name]?.message)
  })

  test('correctly sets errors when maxLength exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
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

    const expectedErrors: FieldErrorRecord = {
      [ref.name]: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULE.maxLength,
        message: '',
        types: {
          [INPUT_VALIDATION_RULE.maxLength]: true,
        },
      },
    }

    expect(context.errors).toEqual(expectedErrors)
  })

  test('correctly sets errors when minLength exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
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

    const expectedErrors: FieldErrorRecord = {
      [ref.name]: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULE.minLength,
        message: '',
        types: {
          [INPUT_VALIDATION_RULE.minLength]: true,
        },
      },
    }

    expect(context.errors).toEqual(expectedErrors)
  })

  test('no errors for array length within bounds', () => {
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
      inputValue: [],
      formValues: {},
      shouldSetCustomValidity: true,
      isFieldArray: true,
    }

    nativeValidateMinMaxLength(context, noop)

    const expectedErrors: FieldErrorRecord = {}

    expect(context.errors).toEqual(expectedErrors)
  })
})
