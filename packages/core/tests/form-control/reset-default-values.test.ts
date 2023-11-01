import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('resetDefaultValues', () => {
    test('resets form with results of default values function', async () => {
      const values = {
        name: 'Hello, World!',
        foo: 'bar',
        baz: 'qux',
      }

      const formControl = new FormControl({
        defaultValues: () => values,
      })

      await formControl.resetDefaultValues()

      expect(formControl.stores.values.value).toEqual(values)
    })
  })
})
