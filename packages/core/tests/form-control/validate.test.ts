import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('updateValid', () => {
    test('returns true if no resolver and values are natively valid', async () => {
      const formControl = new FormControl()

      const result = await formControl.validate()

      expect(result.isValid).toBeTruthy()
    })

    test('returns true for resolver that returns undefined for errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {} }),
      })

      const result = await formControl.validate()

      expect(result.isValid).toBeTruthy()
    })

    test('returns true for resolver that returns empty object for errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {}, errors: {} }),
      })

      const result = await formControl.validate()

      expect(result.isValid).toBeTruthy()
    })

    test('returns false for native validation errors', async () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          required: true,
          mount: true,
        },
      }

      const result = await formControl.validate()

      expect(result.isValid).toBeFalsy()
    })

    test('returns false for resolver that returns errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {}, errors: { name: { type: 'required' } } }),
      })

      const result = await formControl.validate()

      expect(result.isValid).toBeFalsy()
    })

    test('returns false when validating a specific field name that has a validation error', async () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          required: true,
          mount: true,
        },
      }

      const result = await formControl.validate(name)

      expect(result.isValid).toBeFalsy()
    })

    test('returns false when validating field names and an error occurs for one of them', async () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          required: true,
          mount: true,
        },
      }

      const result = await formControl.validate([name])

      expect(result.isValid).toBeFalsy()
    })
  })
})
