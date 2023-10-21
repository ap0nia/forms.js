import { describe, expect, test } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('mount and unmount', () => {
    test('should set mount status to false', () => {
      const formControl = new FormControl()

      formControl.mount()

      expect(formControl.mounted).toBeTruthy()

      formControl.unmount()

      expect(formControl.mounted).toBeFalsy()
    })
  })
})
