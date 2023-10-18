import { waitFor } from '@testing-library/dom'
import { describe, expect, test, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('resetDefaultValues', async () => {
    test('sets isLoading to false if no values provided', () => {
      const formControl = new FormControl()

      formControl.state.isLoading.set(true)

      const fn = vi.fn()

      formControl.state.isLoading.subscribe(fn)

      fn.mockClear()

      formControl.resetDefaultValues()

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith(false)
    })

    test('sets isLoading to false if function resolves to undefined values', async () => {
      const formControl = new FormControl()

      formControl.state.isLoading.set(true)

      const fn = vi.fn()

      formControl.state.isLoading.subscribe(fn)

      fn.mockClear()

      await formControl.resetDefaultValues(() => {})

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith(false)
    })

    test('sets isLoading to true if values is a promise, then sets it to false after resolved', async () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      formControl.state.isLoading.subscribe(fn)

      fn.mockClear()

      formControl.resetDefaultValues(new Promise((resolve) => setTimeout(resolve, 100)))

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith(true)

      await waitFor(() => expect(fn).toHaveReturnedTimes(2))
      await waitFor(() => expect(fn).toHaveBeenLastCalledWith(false))
    })

    test('updates default values', async () => {
      const formControl = new FormControl()

      const values = {
        a: {
          b: {
            c: true,
          },
        },
      }

      formControl.resetDefaultValues(values)

      expect(formControl.state.defaultValues.value).toEqual(values)
    })

    test('updates values when resetValues is true', async () => {
      const formControl = new FormControl()

      const values = {
        a: {
          b: {
            c: true,
          },
        },
      }

      formControl.resetDefaultValues(values, true)

      expect(formControl.state.values.value).toEqual(values)
    })
  })

  test('notifies subscribers via derivedState at most twice', async () => {})
})
