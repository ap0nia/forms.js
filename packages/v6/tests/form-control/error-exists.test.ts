import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('errorExists', () => {
    test('returns true if there is an error', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.state.errors.set({ [name]: {} })

      expect(formControl.errorExists(name)).toBeTruthy()
    })

    test('returns false if there is no error', () => {
      const formControl = new FormControl()

      expect(formControl.errorExists('name')).toBeFalsy()
    })
  })
})
