import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('getDirty', () => {
    test('returns false if values are the same', () => {
      const formControl = new FormControl()

      expect(formControl.getDirty()).toBeFalsy()
    })

    test('returns true if values are different', () => {
      const formControl = new FormControl({ defaultValues: { name: 'Elysia' } })

      formControl.values.name = 'Aponia'

      expect(formControl.getDirty()).toBeTruthy()
    })
  })
})
