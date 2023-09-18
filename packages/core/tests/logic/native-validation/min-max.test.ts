import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULES } from '../../../src/constants'
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

  test('does not mutate errors when field is empty', () => {
    const next = vi.fn()

    const context: NativeValidationContext = { ...defaultContext, inputValue: '' }

    nativeValidateMinMax(context, next)

    expect(context.errors).toEqual({})
  })

  test('exceed min bound', () => {
    const next = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      errors: {},
      inputValue: '0',
    }

    nativeValidateMinMax(context, next)

    expect(context.errors).toEqual({
      test: {
        type: 'min',
        message,
        ref: {
          name: 'test',
        },
      },
    })
  })

  test('no message', () => {
    const next = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      errors: {},
      inputValue: '0',
      field: {
        _f: {
          name: 'test',
          ref: {
            name: 'test',
          },
          min: 1,
        },
      },
      validateAllFieldCriteria: true,
    }

    nativeValidateMinMax(context, next)

    expect(context.errors).toEqual({
      test: {
        type: 'min',
        message: '',
        ref: {
          name: 'test',
        },
        types: {
          [INPUT_VALIDATION_RULES.min]: true,
        },
      },
    })
  })

  test('validate all field criteria', () => {
    const next = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      errors: {},
      inputValue: '0',
      validateAllFieldCriteria: true,
    }

    nativeValidateMinMax(context, next)

    expect(context.errors).toEqual({
      test: {
        type: 'min',
        message,
        ref: {
          name: 'test',
        },
        types: {
          min: message,
        },
      },
    })
  })

  test('does not mutate errors when field has no constraints', () => {
    const context: NativeValidationContext = {
      ...defaultContext,
      field: {
        _f: {
          name: 'test',
          ref: {
            name: 'test',
          },
        },
      },
    }

    nativeValidateMinMax(context)

    expect(context.errors).toEqual({})
  })

  test('does not mutate errors when neither bounds are exceeded', () => {
    const context: NativeValidationContext = {
      ...defaultContext,
      inputValue: '5',
    }

    nativeValidateMinMax(context)

    expect(context.errors).toEqual({})
  })

  test('time values as bounds', () => {
    const context: NativeValidationContext = {
      ...defaultContext,
      inputValue: '2021-01-01',
      field: {
        _f: {
          name: 'test',
          valueAsDate: true,
          min: {
            value: '2020-01-01',
            message,
          },
          max: {
            value: '2022-01-01',
            message,
          },
          ref: {
            name: 'test',
            type: 'time',
          },
        },
      },
    }

    nativeValidateMinMax(context)

    expect(context.errors).toEqual({})
  })

  test('week values as bounds', () => {
    const context: NativeValidationContext = {
      ...defaultContext,
      inputValue: '2021-W01',
      field: {
        _f: {
          name: 'test',
          valueAsDate: true,
          min: {
            value: '2020-W01',
            message,
          },
          max: {
            value: '2022-W01',
            message,
          },
          ref: {
            name: 'test',
            type: 'week',
          },
        },
      },
    }

    nativeValidateMinMax(context)

    expect(context.errors).toEqual({})
  })

  test('valueAsDate as inputValue', () => {
    const next = vi.fn()

    const context: NativeValidationContext = {
      ...defaultContext,
      field: {
        _f: {
          name: 'test',
          min: {
            value: '2020-01-01',
            message,
          },
          max: {
            value: '2022-01-01',
            message,
          },
          ref: {
            name: 'test',
            valueAsDate: new Date('2021-01-01'),
          },
        },
      },
    }

    nativeValidateMinMax(context, next)

    expect(context.errors).toEqual({})
  })

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
