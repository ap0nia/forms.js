import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('getDirty', () => {
    test('returns false if values are equal to default values', () => {
      const formControl = new FormControl()
      expect(formControl.getDirty()).toBeFalsy()
    })

    test('returns true if values are not equal to default values', () => {
      const formControl = new FormControl()

      formControl.state.values.set({ foo: 'bar' })

      expect(formControl.getDirty()).toBeTruthy()
    })
  })
})
