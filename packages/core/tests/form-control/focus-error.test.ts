import { describe, test } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('focusError', () => {
    test('should not focus error ', () => {
      const formControl = new FormControl()

      formControl.focusError()
    })

    test('should not focus error', () => {
      const formControl = new FormControl({ shouldFocusError: false })

      formControl.focusError()
    })

    test('should focus error with root option set', () => {
      const formControl = new FormControl({ shouldFocusError: true })

      formControl.focusError()
    })

    test('should focus error with local option set', () => {
      const formControl = new FormControl({ shouldFocusError: false })

      formControl.focusError({ shouldFocus: true })
    })
  })
})
