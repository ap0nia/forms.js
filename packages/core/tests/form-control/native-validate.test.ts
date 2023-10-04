import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldError } from '../../src/types/errors'

describe('FormContol', () => {
  describe('nativeValidate', () => {
    test('valid if nothing to validate', async () => {
      const formControl = new FormControl()

      const result = await formControl.nativeValidate()

      expect(result.valid).toBeTruthy()
      expect(result.names).toEqual([])
      expect(result.errors).toEqual({})
    })
  })

  test('valid if invalid fields are filtered from checking', async () => {
    const formControl = new FormControl()

    formControl.fields['name'] = {
      _f: {
        ref: {
          name: 'name',
        },
        name: 'name',
        mount: true,
        required: true,
      },
    }

    // The 'name' field is invalid since it is required and its value is undefined.
    // But we're filtering it out from validation, so it will not register as an error.
    const result = await formControl.nativeValidate('not-a-field')

    const expectedErrors: Record<string, FieldError> = {}

    expect(result.valid).toBeTruthy()
    expect(result.names).toEqual([])
    expect(result.errors).toEqual(expectedErrors)
  })

  test('single valid input', async () => {
    const formControl = new FormControl()

    formControl.fields['name'] = {
      _f: {
        ref: {
          name: 'name',
        },
        name: 'name',
        mount: true,
        required: true,
      },
    }

    formControl.values.set({ name: 'test' })

    const result = await formControl.nativeValidate()

    const expectedErrors: Record<string, FieldError> = {}

    expect(result.valid).toBeTruthy()
    expect(result.names).toEqual(['name'])
    expect(result.errors).toEqual(expectedErrors)
  })

  test('single invalid input', async () => {
    const formControl = new FormControl()

    formControl.fields['name'] = {
      _f: {
        ref: {
          name: 'name',
        },
        name: 'name',
        mount: true,
        required: true,
      },
    }

    const result = await formControl.nativeValidate()

    const expectedErrors: Record<string, FieldError> = {
      name: {
        message: '',
        ref: {
          name: 'name',
        },
        type: 'required',
      },
    }

    expect(result.valid).toBeFalsy()
    expect(result.names).toEqual(['name'])
    expect(result.errors).toEqual(expectedErrors)
  })

  test('single invalid field array input', async () => {
    const formControl = new FormControl()

    formControl.fields['name'] = {
      _f: {
        ref: {
          name: 'name',
        },
        name: 'name',
        mount: true,
        required: true,
      },
    }

    formControl.names.array.add('name')

    const result = await formControl.nativeValidate()

    /**
     * The native validation doesn't distinguish between field array errors and regular ones.
     */
    const expectedValidationErrors: Record<string, FieldError> = {
      name: {
        message: '',
        ref: {
          name: 'name',
        },
        type: 'required',
      },
    }

    expect(result.valid).toBeFalsy()
    expect(result.names).toEqual(['name'])
    expect(result.errors).toEqual(expectedValidationErrors)
  })
})
