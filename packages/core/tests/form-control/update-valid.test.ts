import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('updateValid', () => {
    test('no resolver and valid', async () => {
      const formControl = new FormControl()

      await formControl.updateValid()

      expect(formControl.state.isValid.value).toBeTruthy()
    })

    test('resolver that returns null errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {} }),
      })

      await formControl.updateValid()

      expect(formControl.state.isValid.value).toBeTruthy()
    })

    test('resolver that returns empty object errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {}, errors: {} }),
      })

      await formControl.updateValid()

      expect(formControl.state.isValid.value).toBeTruthy()
    })
  })
})
