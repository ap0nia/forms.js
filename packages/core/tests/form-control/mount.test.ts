import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('mount', () => {
    test('sets mounted to true', () => {
      const formControl = new FormControl()

      expect(formControl.mounted).toBeFalsy()

      formControl.mount()

      expect(formControl.mounted).toBeTruthy()
    })
  })
})
