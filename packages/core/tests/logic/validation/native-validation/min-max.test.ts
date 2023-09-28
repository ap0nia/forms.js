import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULE } from '../../../../src/constants'
import {
  nativeValidateMinMax,
  fieldExceedsBounds,
  convertToDate,
  type ExceedBoundsResult,
} from '../../../../src/logic/validation/native-validation/min-max'
import type { NativeValidationContext } from '../../../../src/logic/validation/native-validation/types'
import type { FieldErrorRecord } from '../../../../src/types/errors'
import type { Field } from '../../../../src/types/fields'
import { noop } from '../../../../src/utils/noop'

describe('nativeValidateMinMax', () => {
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

    nativeValidateMinMax(context, noop)

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
          min: 1,
          max: 10,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: '5',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateMinMax(context, noop)

    const expectedErrors: FieldErrorRecord = {}

    expect(context.errors).toEqual(expectedErrors)
  })

  test('calls setCustomValidity if max exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          max: 10,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 11,
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateMinMax(context, noop)

    const expectedErrors: FieldErrorRecord = {
      [ref.name]: {
        type: INPUT_VALIDATION_RULE.max,
        message: '',
        ref,
      },
    }

    expect(context.errors).toEqual(expectedErrors)

    expect(ref.setCustomValidity).toHaveBeenCalledWith('')
  })

  test('calls setCustomValidity if min exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          min: 10,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 1,
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateMinMax(context, noop)

    const expectedErrors: FieldErrorRecord = {
      [ref.name]: {
        type: INPUT_VALIDATION_RULE.min,
        message: '',
        ref,
      },
    }

    expect(context.errors).toEqual(expectedErrors)

    expect(ref.setCustomValidity).toHaveBeenCalledWith(expectedErrors[ref.name]?.message)
  })

  test('correctly sets errors when max exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          max: 1,
        },
      },
      errors: {
        /**
         * This covers the optional chaining for existing errors at the same field name.
         */
        [ref.name]: {
          type: 'max',
        },
      },
      inputRef: ref,
      inputValue: 10,
      formValues: {},
      validateAllFieldCriteria: true,
    }

    nativeValidateMinMax(context, noop)

    const expectedErrors: FieldErrorRecord = {
      [ref.name]: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULE.max,
        message: '',
        types: {
          [INPUT_VALIDATION_RULE.max]: true,
        },
      },
    }

    expect(context.errors).toEqual(expectedErrors)
  })

  test('correctly sets errors when min exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          min: 10,
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: 0,
      formValues: {},
      validateAllFieldCriteria: true,
    }

    nativeValidateMinMax(context, noop)

    const expectedErrors: FieldErrorRecord = {
      [ref.name]: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULE.min,
        message: '',
        types: {
          [INPUT_VALIDATION_RULE.min]: true,
        },
      },
    }

    expect(context.errors).toEqual(expectedErrors)
  })
})

describe('fieldExceedsBounds', () => {
  test('number in bounds', () => {
    const ref = document.createElement('input')

    ref.name = 'number'

    const field: Field = {
      _f: {
        name: ref.name,
        min: 0,
        max: 10,
        ref,
      },
    }

    const result = fieldExceedsBounds(field, 0)

    const expectedResult: ExceedBoundsResult = {
      exceedMax: false,
      exceedMin: false,
      minLength: {
        message: '',
        value: 0,
      },
      maxLength: {
        message: '',
        value: 10,
      },
    }

    expect(result).toEqual(expectedResult)
  })

  test('date string that exceeds min', () => {
    const ref = document.createElement('input')

    ref.name = 'date'

    const field: Field = {
      _f: {
        name: ref.name,
        min: '2021-01-01',
        max: '2021-01-10',
        ref,
      },
    }

    const result = fieldExceedsBounds(field, '2020-01-01')

    const expectedResult: ExceedBoundsResult = {
      exceedMax: false,
      exceedMin: true,
      minLength: {
        message: '',
        value: '2021-01-01',
      },
      maxLength: {
        message: '',
        value: '2021-01-10',
      },
    }

    expect(result).toEqual(expectedResult)
  })

  test('time that exceeds max', () => {
    const ref = document.createElement('input')

    ref.name = 'time'
    ref.type = 'time'

    const field: Field = {
      _f: {
        name: ref.name,
        min: '00:00',
        max: '10:00',
        ref,
      },
    }

    const result = fieldExceedsBounds(field, '11:00')

    const expectedResult: ExceedBoundsResult = {
      exceedMax: true,
      exceedMin: false,
      minLength: {
        message: '',
        value: '00:00',
      },
      maxLength: {
        message: '',
        value: '10:00',
      },
    }

    expect(result).toEqual(expectedResult)
  })

  test('week that exceeds max', () => {
    const ref = document.createElement('input')

    ref.name = 'test'
    ref.type = 'week'

    const field: Field = {
      _f: {
        name: ref.name,
        min: '2021-W01',
        max: '2021-W10',
        ref,
      },
    }

    const result = fieldExceedsBounds(field, '2021-W11')

    const expectedResult: ExceedBoundsResult = {
      exceedMax: true,
      exceedMin: false,
      minLength: {
        message: '',
        value: '2021-W01',
      },
      maxLength: {
        message: '',
        value: '2021-W10',
      },
    }

    expect(result).toEqual(expectedResult)
  })
})

describe('convertToDate', () => {
  test('works with string', () => {
    const result = convertToDate('2021-01-01')

    expect(result).toBeInstanceOf(Date)
  })

  test('works with number', () => {
    const result = convertToDate(1612137600000)

    expect(result).toBeInstanceOf(Date)
  })

  test('works with Date', () => {
    const result = convertToDate(new Date('2021-01-01'))

    expect(result).toBeInstanceOf(Date)
  })
})
