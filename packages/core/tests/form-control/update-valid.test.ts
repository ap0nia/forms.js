import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import { noop } from '../../src/utils/noop'

describe('FormControl', () => {
  describe('update valid', () => {
    test('does nothing if no subscribers', () => {
      const formControl = new FormControl()

      formControl.register('hello', { required: true })

      const originalValue = formControl.state.isValid.value

      formControl.updateValid()

      expect(formControl.state.isValid.value).toBe(originalValue)
    })

    test('updates valid state for invalid form when proxy state accessed', async () => {
      const formControl = new FormControl()

      formControl.register('hello', { required: true })

      formControl.derivedState.proxy.isValid

      const subscriber = vi.fn(noop)

      formControl.state.isValid.subscribe(subscriber)

      await formControl.updateValid()

      // Since the value stayed false, it doesn't get notified again.
      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(false)

      expect(formControl.state.isValid.value).toBeFalsy()
    })

    test('updates valid state for valid form when subscribers present', async () => {
      const formControl = new FormControl()

      formControl.register('hello')

      formControl.derivedState.proxy.isValid

      const subscriber = vi.fn(noop)

      formControl.state.isValid.subscribe(subscriber)

      await formControl.updateValid()

      // The value changed from false to true, so it gets notified.
      expect(subscriber).toHaveBeenCalled()
      expect(subscriber).toHaveBeenLastCalledWith(true)

      expect(formControl.state.isValid.value).toBeTruthy()
    })
  })
})
