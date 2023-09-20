import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('constructor', () => {
    test('no default values and no values sets both as empty object', () => {
      const form = new FormControl()

      expect(form.defaultValues).toEqual({})

      expect(form.values).toEqual({})
    })

    test('default values and no values sets both', () => {
      const defaultValues = { foo: 'bar' }

      const form = new FormControl({ defaultValues })

      expect(form.defaultValues).toEqual(defaultValues)

      expect(form.values).toEqual(defaultValues)
    })

    test('values and no default values sets both', () => {
      const values = { foo: 'bar' }

      const form = new FormControl({ values })

      expect(form.defaultValues).toEqual(values)

      expect(form.values).toEqual(values)
    })

    test('shouldUnregister and default values does not set values', () => {
      const defaultValues = { foo: 'bar' }

      const form = new FormControl({ defaultValues, shouldUnregister: true })

      expect(form.defaultValues).toEqual(defaultValues)

      expect(form.values).toEqual({})
    })
  })
})
