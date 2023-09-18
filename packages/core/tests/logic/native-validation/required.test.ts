import { describe, test, expect, vi } from 'vitest'

import { INPUT_VALIDATION_RULES } from '../../../src/constants'
import type { Field } from '../../../src/logic/fields'
import {
  nativeValidateRequired,
  requiredButMissing,
} from '../../../src/logic/native-validation/required'
import type { NativeValidationContext } from '../../../src/logic/native-validation/types'
import { noop } from '../../../src/utils/noop'

describe('nativeValidateRequired', () => {
  test('no errors if not missing', () => {
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

    nativeValidateRequired(context, noop)

    expect(context.errors).toEqual({})
  })

  test('correctly sets error if required validation rule and missing', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          required: {
            value: true,
            message: 'Please enter a value',
          },
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: '',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateRequired(context, noop)

    expect(context.errors).toEqual({
      test: {
        type: 'required',
        message: 'Please enter a value',
        ref,
      },
    })
  })

  test('correctly sets error if required string and missing', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          required: 'Please enter a value',
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: '',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateRequired(context, noop)

    expect(context.errors).toEqual({
      test: {
        type: 'required',
        message: 'Please enter a value',
        ref,
      },
    })
  })

  test('calls setCustomValidity if missing', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    ref.setCustomValidity = vi.fn()

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          required: {
            value: true,
            message: 'Please enter a value',
          },
        },
      },
      errors: {},
      inputRef: ref,
      inputValue: '',
      formValues: {},
      shouldSetCustomValidity: true,
    }

    nativeValidateRequired(context, noop)

    expect(context.errors).toEqual({
      test: {
        type: 'required',
        message: 'Please enter a value',
        ref,
      },
    })

    expect(ref.setCustomValidity).toHaveBeenCalledWith('Please enter a value')
  })

  test('correctly sets error if missing', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const context: NativeValidationContext = {
      field: {
        _f: {
          name: ref.name,
          ref,
          required: true,
        },
      },
      errors: {
        /**
         * This covers the optional chaining for existing errors at the same field name.
         */
        [ref.name]: {
          type: 'required',
        },
      },
      inputRef: ref,
      inputValue: '',
      formValues: {},
      validateAllFieldCriteria: true,
    }

    nativeValidateRequired(context, noop)

    expect(context.errors).toEqual({
      test: {
        type: 'required',
        message: '',
        ref,
        types: {
          [INPUT_VALIDATION_RULES.required]: true,
        },
      },
    })
  })
})

describe('requiredButMissing', () => {
  test('missing if field array, but value is not an array', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
      },
    }

    expect(requiredButMissing(field, '', true)).toBeTruthy()
  })

  test('missing if field array, but value is empty array', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
      },
    }

    expect(requiredButMissing(field, [], true)).toBeTruthy()
  })

  test('not missing if field is not required', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
      },
    }

    expect(requiredButMissing(field, '')).toBeFalsy()
  })

  test('missing if required but not checked', () => {
    const ref = document.createElement('input')

    ref.name = 'test'
    ref.type = 'checkbox'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
        required: true,
      },
    }

    expect(requiredButMissing(field, [])).toBeTruthy()
  })

  test('missing if not a radio or checkbox input, but value is null', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
        required: true,
      },
    }

    expect(requiredButMissing(field, null)).toBeTruthy()
  })

  test('missing if radio or checkbox input and value is false', () => {
    const ref = document.createElement('input')

    ref.name = 'test'
    ref.type = 'checkbox'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
        required: true,
      },
    }

    expect(requiredButMissing(field, false)).toBeTruthy()
  })

  test('missing if invalid radio value', () => {
    const ref = document.createElement('input')

    ref.name = 'test'
    ref.type = 'radio'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
        required: true,
      },
    }

    expect(requiredButMissing(field, 'hello')).toBeTruthy()
  })

  test('not missing if not a radio or checkbox input, and value is defined', () => {
    const ref = document.createElement('input')

    ref.name = 'test'

    const field: Field = {
      _f: {
        name: ref.name,
        ref,
        required: true,
      },
    }

    expect(requiredButMissing(field, 'hello')).toBeFalsy()
  })
})
