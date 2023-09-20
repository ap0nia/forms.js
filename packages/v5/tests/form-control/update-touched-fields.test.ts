import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('updateTouchedFields', () => {
    test('updates the specified field and update is true since changed', () => {
      const formControl = new FormControl()

      formControl.register('name')

      expect(formControl.updateTouchedFields('name')).toBeTruthy()
    })

    test('does not update the specified field if already touched', () => {
      const formControl = new FormControl()

      formControl.register('name')

      formControl.updateTouchedFields('name')

      expect(formControl.updateTouchedFields('name')).toBeFalsy()
    })
  })
})
