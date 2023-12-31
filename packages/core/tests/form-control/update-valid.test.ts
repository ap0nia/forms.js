import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('update valid', () => {
    test('does nothing if no subscribers', () => {
      const formControl = new FormControl()

      const name = 'hello'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          mount: true,
          required: true,
        },
      }

      const originalValue = formControl.stores.isValid.value

      formControl.updateValid()

      expect(formControl.stores.isValid.value).toBe(originalValue)
    })

    test('updates valid state for invalid form when proxy state accessed', async () => {
      const formControl = new FormControl()

      const name = 'hello'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          mount: true,
          required: true,
        },
      }

      formControl.state.proxy.isValid

      const subscriber = vi.fn()

      formControl.stores.isValid.subscribe(subscriber)

      await formControl.updateValid()

      // Since the value stayed false, it doesn't get notified again.
      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(false, undefined)

      expect(formControl.stores.isValid.value).toBeFalsy()
    })

    test('updates valid state for valid form when subscribers present', async () => {
      const formControl = new FormControl()

      const name = 'hello'

      formControl.fields[name] = {
        _f: {
          name,
          ref: { name },
          mount: true,
        },
      }

      formControl.state.proxy.isValid

      const subscriber = vi.fn()

      formControl.stores.isValid.subscribe(subscriber)

      await formControl.updateValid()

      // The value changed from false to true, so it gets notified.
      expect(subscriber).toHaveBeenCalled()
      expect(subscriber).toHaveBeenLastCalledWith(true, undefined)

      expect(formControl.stores.isValid.value).toBeTruthy()
    })
  })
})
