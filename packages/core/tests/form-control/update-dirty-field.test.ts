import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('updateDirtyField', () => {
    test('removes dirty flag if setting field back to default value', () => {
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

      expect(formControl.stores.dirtyFields.value).toEqual({ name: true })

      // Step 2: set the field to the default value, marking it clean.

      expect(formControl.updateDirtyField('name')).toBeTruthy()

      expect(formControl.stores.dirtyFields.value).toEqual({})
    })

    test('updates isDirty only when there are subscribers', () => {
      const formControl = new FormControl()

      formControl.stores.values.set({
        hello: 'world',
      })

      // This shouldn't update isDirty because it isn't being tracked.
      formControl.updateDirtyField('hello', '')

      expect(formControl.stores.isDirty.value).toBeFalsy()

      // Subscribe to isDirty and cause it to be tracked.
      formControl.state.proxy.isDirty

      // This should update isDirty because it is being tracked.
      formControl.updateDirtyField('hello', '')

      expect(formControl.stores.isDirty.value).toBeTruthy()
    })
  })
})
