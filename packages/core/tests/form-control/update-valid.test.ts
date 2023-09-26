import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('update valid', () => {
    test('does nothing if no subscribers', () => {
      const control = new FormControl()

      control.register('hello', { required: true })

      const originalValue = control.state.isValid.value

      control.updateValid()

      expect(control.state.isValid.value).toBe(originalValue)
    })
  })
})
