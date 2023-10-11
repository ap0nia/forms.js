import { waitFor } from '@testing-library/dom'
import { describe, expect, test, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('resetDefaultValues', async () => {
    test('async default values changes loading state', async () => {
      let isLoading = false

      new FormControl({
        defaultValues: async () => {},
        plugins: [
          {
            onInit(formControl) {
              // To hit test coverage, this artificially sets the loading value to false,
              // but it should normally be calculated (correctly) as true for asynchronous default values.
              formControl.state.isLoading.value = isLoading

              formControl.state.isLoading.subscribe((value) => {
                isLoading = value
              })
            },
          },
        ],
      })

      // isLoading should be forced to true when resetting the default values because it's a promise.
      await waitFor(() => expect(isLoading).toBeTruthy())

      // After the promise resolves, isLoading should be false.
      await waitFor(() => expect(isLoading).toBeFalsy())
    })

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
