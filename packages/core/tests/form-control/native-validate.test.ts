import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('nativeValidate', () => {
    test('does not do anything if nothing to validate', async () => {
      const formControl = new FormControl()

      const result = await formControl.nativeValidate()

      expect(result.valid).toBeTruthy()
      expect(result.names).toEqual([])
      expect(result.errors).toEqual({})
    })
  })

  test('validates a single valid input', async () => {
    const formControl = new FormControl()

    formControl.register('name', { required: true, value: 'test' })

    formControl.values['name'] = 'test'

    const result = await formControl.nativeValidate()

    expect(result.valid).toBeTruthy()
    expect(result.names).toEqual(['name'])
    expect(result.errors).toEqual({})
  })

  test('validates a single invalid input', async () => {
    const formControl = new FormControl()

    formControl.register('name', { required: true })

    const result = await formControl.nativeValidate()

    expect(result.valid).toBeFalsy()
    expect(result.names).toEqual(['name'])
    expect(result.errors).toEqual({
      name: {
        message: '',
        ref: {
          name: 'name',
        },
        type: 'required',
      },
    })
  })

  /**
   * TODO: how does it look with existing field array errors?
   */
  test('validates a single invalid field array input', async () => {
    const formControl = new FormControl()

    formControl.register('name', { required: true })

    formControl.names.array.add('name')

    const result = await formControl.nativeValidate()

    expect(result.valid).toBeFalsy()
    expect(result.names).toEqual(['name'])
    expect(result.errors).toEqual({
      name: {
        message: '',
        ref: {
          name: 'name',
        },
        type: 'required',
      },
    })
  })
})
