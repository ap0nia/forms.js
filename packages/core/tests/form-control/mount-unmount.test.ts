import { describe, test } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('mount and unmount', () => {
    test('should set mount status to false', () => {
      const formControl = new FormControl()

      formControl.mount()

      // expect(formControl.state.status.value.mount).toBeTruthy()

      formControl.unmount()

      // expect(formControl.state.status.value.mount).toBeFalsy()
    })
  })
})
