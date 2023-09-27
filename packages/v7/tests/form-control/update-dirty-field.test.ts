import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('updateDirtyField', () => {
    test('setting default value for dirty field updates to clean', () => {
      const formControl = new FormControl()

      formControl.fields['name'] = {
        _f: {
          ref: {
            name: 'name',
          },
          name: 'name',
        },
      }

      // Step 1: make the field dirty by setting a non-default value.
      // All default values are "undefined" since it was not set.

      expect(formControl.updateDirtyField('name', 'value')).toBeTruthy()

      expect(formControl.state.dirtyFields.value).toEqual({ name: true })

      // Step 2: set the field to the default value, marking it clean.

      expect(formControl.updateDirtyField('name')).toBeTruthy()

      expect(formControl.state.dirtyFields.value).toEqual({})
    })
  })
})
