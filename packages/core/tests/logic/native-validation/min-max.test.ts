import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULES } from '../../../src/constants'
import type { Field } from '../../../src/logic/fields'
import {
  nativeValidateMinMax,
  fieldExceedsBounds,
  convertToDate,
} from '../../../src/logic/native-validation/min-max'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'
import { noop } from '../../../src/utils/noop'

describe('nativeValidateMinMax', () => {
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

    nativeValidateMinMax(context, noop)

    expect(context.errors).toEqual({})
  })

  test('no errors if inside bounds', () => {
    const ref = document.createElement('input')

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
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

    expect(context.errors).toEqual({})
  })

  test('calls setCustomValidity if max exceeded', () => {
    const ref = document.createElement('input')

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
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

    expect(context.errors).toEqual({
      test: {
        type: INPUT_VALIDATION_RULES.max,
        message: '',
        ref,
      },
    })

    expect(ref.setCustomValidity).toHaveBeenCalledWith('')
  })

  test('calls setCustomValidity if min exceeded', () => {
    const ref = document.createElement('input')

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
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

    expect(context.errors).toEqual({
      test: {
        type: INPUT_VALIDATION_RULES.min,
        message: '',
        ref,
      },
    })

    expect(ref.setCustomValidity).toHaveBeenCalledWith('')
  })

  test('correctly sets errors when max exceeded', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
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

    expect(context.errors).toEqual({
      test: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULES.max,
        message: '',
        types: {
          [INPUT_VALIDATION_RULES.max]: true,
        },
      },
    })
  })

  test('correctly sets errors when min exceeded', () => {
    const ref = document.createElement('input')

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: 'test',
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

    expect(context.errors).toEqual({
      test: {
        ref: context.field._f.ref,
        type: INPUT_VALIDATION_RULES.min,
        message: '',
        types: {
          [INPUT_VALIDATION_RULES.min]: true,
        },
      },
    })
  })
})

describe('fieldExceedsBounds', () => {
  test('number in bounds', () => {
    const ref = document.createElement('input')

    const field: Field = {
      _f: {
        name: 'test',
        min: 0,
        max: 10,
        ref,
      },
    }

    const result = fieldExceedsBounds(field, 0)

    expect(result).toEqual({
      exceedMax: false,
      exceedMin: false,
      minOutput: {
        message: '',
        value: 0,
      },
      maxOutput: {
        message: '',
        value: 10,
      },
    })
  })

  test('date string that exceeds min', () => {
    const ref = document.createElement('input')

    const field: Field = {
      _f: {
        name: 'test',
        min: '2021-01-01',
        max: '2021-01-10',
        ref,
      },
    }

    const result = fieldExceedsBounds(field, '2020-01-01')

    expect(result).toEqual({
      exceedMax: false,
      exceedMin: true,
      minOutput: {
        message: '',
        value: '2021-01-01',
      },
      maxOutput: {
        message: '',
        value: '2021-01-10',
      },
    })
  })

  test('time that exceeds max', () => {
    const ref = document.createElement('input')

    ref.type = 'time'

    const field: Field = {
      _f: {
        name: 'test',
        min: '00:00',
        max: '10:00',
        ref,
      },
    }

    const result = fieldExceedsBounds(field, '11:00')

    expect(result).toEqual({
      exceedMax: true,
      exceedMin: false,
      minOutput: {
        message: '',
        value: '00:00',
      },
      maxOutput: {
        message: '',
        value: '10:00',
      },
    })
  })

  test('week that exceeds max', () => {
    const ref = document.createElement('input')

    ref.type = 'week'

    const field: Field = {
      _f: {
        name: 'test',
        min: '2021-W01',
        max: '2021-W10',
        ref,
      },
    }

    const result = fieldExceedsBounds(field, '2021-W11')

    expect(result).toEqual({
      exceedMax: true,
      exceedMin: false,
      minOutput: {
        message: '',
        value: '2021-W01',
      },
      maxOutput: {
        message: '',
        value: '2021-W10',
      },
    })
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
