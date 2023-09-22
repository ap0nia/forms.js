import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('updateTouchedFields', () => {
    test('returns true for first touch', () => {
      const formControl = new FormControl()

      const name = 'name'

      // No touched fields yet.
      expect(formControl.state.touchedFields.value).toEqual({})

      // Truthy because it's the first time the field is touched.
      expect(formControl.updateTouchedField(name)).toBeTruthy()

      expect(formControl.state.touchedFields.value).toEqual({ [name]: true })
    })

    test('mutates touched fields', () => {
      const formControl = new FormControl()

      const name = 'name'

      // No touched fields yet.
      expect(formControl.state.touchedFields.value).toEqual({})

      // Truthy because it's the first time the field is touched.
      formControl.updateTouchedField(name)

      expect(formControl.state.touchedFields.value).toEqual({ [name]: true })
    })

    test('returns false for subsequent touches', () => {
      const formControl = new FormControl()

      const name = 'name'

      // No touched fields yet.
      expect(formControl.state.touchedFields.value).toEqual({})

      // Truthy because it's the first time the field is touched.
      formControl.updateTouchedField(name)

      // Falsy because it's the second time the field is touched.
      expect(formControl.updateTouchedField(name)).toBeFalsy()

      expect(formControl.state.touchedFields.value).toEqual({ [name]: true })
    })
  })
})
