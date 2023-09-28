import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('updateValid', () => {
    test('no resolver and valid', async () => {
      const formControl = new FormControl()

      const result = await formControl.validate()

      expect(result.isValid).toBeTruthy()
    })

    test('resolver that returns null errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {} }),
      })

      const result = await formControl.validate()

      expect(result.isValid).toBeTruthy()
    })

    test('resolver that returns empty object errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {}, errors: {} }),
      })

      const result = await formControl.validate()

      expect(result.isValid).toBeTruthy()
    })

    test('no resolver with focus and errors', async () => {
      const formControl = new FormControl()

      formControl.register('name', { required: true })

      const result = await formControl.validate()

      expect(result.isValid).toBeFalsy()
    })

    test('resolver with focus and errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {}, errors: { name: { type: 'required' } } }),
      })

      const result = await formControl.validate()

      expect(result.isValid).toBeFalsy()
    })

    test('with name and errors for different names', async () => {
      const formControl = new FormControl()

      formControl.register('name', { required: true })

      const result = await formControl.validate('name')

      expect(result.isValid).toBeFalsy()
    })

    test('with name array and errors for different names', async () => {
      const formControl = new FormControl()

      formControl.register('name', { required: true })

      const result = await formControl.validate(['name'])

      expect(result.isValid).toBeFalsy()
    })
  })
})
