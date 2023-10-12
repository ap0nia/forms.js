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

    test('only update isDirty when there are subscribers', () => {
      const formControl = new FormControl()

      formControl.state.values.set({
        hello: 'world',
      })

      // This shouldn't update isDirty because it isn't being tracked.
      formControl.updateDirtyField('hello', '')

      expect(formControl.state.isDirty.value).toBeFalsy()

      // Subscribe to isDirty and cause it to be tracked.
      formControl.derivedState.proxy.isDirty

      // This should update isDirty because it is being tracked.
      formControl.updateDirtyField('hello', '')

      expect(formControl.state.isDirty.value).toBeTruthy()
    })
  })
})
