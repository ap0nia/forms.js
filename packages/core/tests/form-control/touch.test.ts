import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('touch', () => {
    test('shouldTouch', async () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.updateTouchedField = vi.fn()

      formControl.touch(name, undefined, { shouldTouch: true })

      expect(formControl.updateTouchedField).toHaveBeenCalledWith(name)
    })

    test('shouldDirty', async () => {
      const formControl = new FormControl()

      const name = 'name'

      const value = undefined

      formControl.updateDirtyField = vi.fn()

      formControl.touch(name, value, { shouldDirty: true })

      expect(formControl.updateDirtyField).toHaveBeenCalledWith(name, value)
    })
  })
})
