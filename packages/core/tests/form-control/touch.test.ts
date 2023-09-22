import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('touch', () => {
    test('shouldTouch', async () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.updateTouchedField = vi.fn()

      await formControl.touch(name, undefined, { shouldTouch: true })

      expect(formControl.updateTouchedField).toHaveBeenCalledWith(name)
    })

    test('shouldDirty', async () => {
      const formControl = new FormControl()

      const name = 'name'

      const value = undefined

      formControl.updateDirtyField = vi.fn()

      await formControl.touch(name, value, { shouldDirty: true })

      expect(formControl.updateDirtyField).toHaveBeenCalledWith(name, value)
    })

    test('shouldValidate', async () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.updateValid = vi.fn()

      await formControl.touch(name, undefined, { shouldValidate: true })

      expect(formControl.updateValid).toHaveBeenCalledWith(name)
    })
  })
})
