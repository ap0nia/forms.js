import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('unmount', () => {
    test('sets mounted to false', () => {
      const formControl = new FormControl()

      formControl.mounted = true

      formControl.unmount()

      expect(formControl.mounted).toBeFalsy()
    })
  })
})
