import { describe, expect, test, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('resetDefaultValues', async () => {
    test('null default values ensures loading state is false', async () => {
      const fn = vi.fn()

      const formControl = new FormControl()

      formControl.state.isLoading.subscribe(fn)
      formControl.state.isLoading.set(true)

      fn.mockReset()

      formControl.resetDefaultValues(undefined)

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith(false)
    })

    test('default values promise that resolves to null sets default values to empty object', async () => {
      const formControl = new FormControl({
        defaultValues: async () => null,
      })

      expect(formControl.state.defaultValues.value).toEqual({})
    })

    test('async default values', async () => {
      const formControl = new FormControl()

      const values = {
        a: {
          b: {
            c: true,
          },
        },
      }

      const defaultValues = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return values
      }

      await formControl.resetDefaultValues(defaultValues, true)

      expect(formControl.state.values.value).toEqual(values)
    })
  })
})
