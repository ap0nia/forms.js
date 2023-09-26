import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('focusFieldByCallback', () => {
    test('false if null or empty key provided', () => {
      const formControl = new FormControl()

      expect(formControl.focusFieldByCallback()).toBeFalsy()

      expect(formControl.focusFieldByCallback(null)).toBeFalsy()

      expect(formControl.focusFieldByCallback('')).toBe(false)
    })

    test('false if field not found', () => {
      const formControl = new FormControl()

      expect(formControl.focusFieldByCallback('foo')).toBeFalsy()
    })

    test('true if field found', () => {
      const formControl = new FormControl()

      const name = 'foo'

      formControl.state.errors.set({
        [name]: {
          type: 'deps',
        },
      })

      expect(formControl.focusFieldByCallback(name)).toBeTruthy()
    })
  })
})
