import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('updateTouchedFields', () => {
    test('updates the specified field and update is true since changed', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.register(name)

      expect(formControl.state.touchedFields.value).toEqual({})

      expect(formControl.updateTouchedField(name)).toBeTruthy()

      expect(formControl.state.touchedFields.value).toEqual({ [name]: true })
    })

    test('does not update the specified field if already touched', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.register(name)

      formControl.updateTouchedField(name)

      expect(formControl.state.touchedFields.value).toEqual({ [name]: true })

      expect(formControl.updateTouchedField(name)).toBeFalsy()

      expect(formControl.state.touchedFields.value).toEqual({ [name]: true })
    })
  })
})
