import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('clearErrors', () => {
    test('resets all errors if no name provided', () => {
      const formControl = new FormControl()

      formControl.state.errors.set({ test: [] })

      formControl.clearErrors()

      expect(formControl.state.errors.value).toEqual({})
    })

    test('resets error only for specified name', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.state.errors.set({ [name]: [], a: [], b: [], c: [] })

      formControl.clearErrors(name)

      expect(formControl.state.errors.value).toEqual({
        a: [],
        b: [],
        c: [],
      })
    })
  })
})
