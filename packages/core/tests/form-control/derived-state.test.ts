import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('derivedState', () => {
    test('derived state does not update when keys have not been loaded', () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      formControl.derivedState.subscribe(fn)

      fn.mockReset()

      formControl.state.submitCount.set(20)
      formControl.state.submitCount.set(100)

      expect(fn).not.toHaveBeenCalled()
    })

    test('derived state updates when keys have been loaded', () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      formControl.derivedState.subscribe(fn)

      fn.mockReset()

      // Accessing this property makes the derived state reactive to changes to this store.
      formControl.derivedState.proxy.submitCount

      formControl.state.submitCount.set(20)
      formControl.state.submitCount.set(100)

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})
