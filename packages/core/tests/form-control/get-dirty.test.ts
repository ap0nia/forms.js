import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('getDirty', () => {
    test('returns false if values are deeply equal to default values', () => {
      const formControl = new FormControl()

      formControl.state.values.set({
        foo: 'bar',
        baz: {
          qux: 'quux',
        },
      })

      formControl.state.defaultValues.set({
        foo: 'bar',
        baz: {
          qux: 'quux',
        },
      })

      expect(formControl.getDirty()).toBeFalsy()
    })

    test('returns true if values are not deeply equal to default values', () => {
      const formControl = new FormControl()

      formControl.state.values.set({
        foo: 'bar',
        baz: {
          qux: 'quux',
        },
      })

      formControl.state.defaultValues.set({
        foo: 'bar',
        baz: {},
      })

      expect(formControl.getDirty()).toBeTruthy()
    })
  })
})
