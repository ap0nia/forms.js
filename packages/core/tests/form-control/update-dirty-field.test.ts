import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('updateDirtyField', () => {
    test('setting default value for clean field does not do anything', () => {
      const formControl = new FormControl()

      formControl.register('name')

      expect(formControl.updateDirtyField('name')).toBeFalsy()

      expect(formControl.values).toEqual({})
    })

    test('setting default value for dirty field updates to clean', () => {
      const formControl = new FormControl()

      formControl.register('name')

      // Step 1: make the field dirty by setting a non-default value.

      expect(formControl.updateDirtyField('name', 'value')).toBeTruthy()

      expect(formControl.formState.dirtyFields).toEqual({ name: true })

      // Step 2: set the field to the default value, marking it clean.

      expect(formControl.updateDirtyField('name')).toBeTruthy()

      expect(formControl.formState.dirtyFields).toEqual({})
    })
  })
})
