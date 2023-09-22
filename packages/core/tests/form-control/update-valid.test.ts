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

    test('no resolver with focus and errors', async () => {
      const formControl = new FormControl()

      formControl.register('name', { required: true })

      await formControl.updateValid(undefined, { shouldFocus: true })

      expect(formControl.state.isValid.value).toBeFalsy()
    })

    test('resolver with focus and errors', async () => {
      const formControl = new FormControl({
        resolver: () => ({ values: {}, errors: { name: { type: 'required' } } }),
      })

      await formControl.updateValid(undefined, { shouldFocus: true })

      expect(formControl.state.isValid.value).toBeFalsy()
    })

    test('with name and errors for different names', async () => {
      const formControl = new FormControl()

      formControl.register('name', { required: true })

      await formControl.updateValid('name', { shouldFocus: true })

      expect(formControl.state.isValid.value).toBeFalsy()
    })

    test('with name array and errors for different names', async () => {
      const formControl = new FormControl()

      formControl.register('name', { required: true })

      await formControl.updateValid(['name'], { shouldFocus: true })

      expect(formControl.state.isValid.value).toBeFalsy()
    })
  })
})
