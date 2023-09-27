import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import { noop } from '../../src/utils/noop'

describe('FormControl', () => {
  describe('update valid', () => {
    test('does nothing if no subscribers', () => {
      const control = new FormControl()

      control.register('hello', { required: true })

      const originalValue = control.state.isValid.value

      control.updateValid()

      expect(control.state.isValid.value).toBe(originalValue)
    })

    test('updates valid state for invalid form when subscribers present', async () => {
      const control = new FormControl()

      control.register('hello', { required: true })

      const subscriber = vi.fn(noop)

      control.state.isValid.subscribe(subscriber)

      await control.updateValid()

      // Since the value stayed false, it doesn't get notified again.
      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(false)

      expect(control.state.isValid.value).toBeFalsy()
    })

    test('updates valid state for valid form when subscribers present', async () => {
      const control = new FormControl()

      control.register('hello')

      const subscriber = vi.fn(noop)

      control.state.isValid.subscribe(subscriber)

      await control.updateValid()

      // The value changed from false to true, so it gets notified.
      expect(subscriber).toHaveBeenCalledTimes(2)
      expect(subscriber).toHaveBeenCalledWith(true)

      expect(control.state.isValid.value).toBeTruthy()
    })
  })
})
