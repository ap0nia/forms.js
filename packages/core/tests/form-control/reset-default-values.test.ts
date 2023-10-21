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

      fn.mockReset()

      formControl.resetDefaultValues()

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith(false)
    })

    test('sets isLoading to false if function resolves to undefined values', async () => {
      const formControl = new FormControl()

      formControl.state.isLoading.set(true)

      const fn = vi.fn()

      formControl.state.isLoading.subscribe(fn)

      fn.mockReset()

      await formControl.resetDefaultValues(() => {})

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenLastCalledWith(false)
    })

    test('sets isLoading to true if values is a promise, then sets it to false after resolved', async () => {
      const formControl = new FormControl()

      const fn = vi.fn()

      formControl.state.isLoading.subscribe(fn)

      fn.mockReset()

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

  describe('properly notifies subscribers to state changes', async () => {
    test('notifies subscribers of derivedState at most twice', async () => {
      const formControl = new FormControl()

      formControl.derivedState.proxy.isLoading
      formControl.derivedState.proxy.values
      formControl.derivedState.proxy.defaultValues

      const derivedFn = vi.fn()

      formControl.derivedState.subscribe(derivedFn)

      derivedFn.mockReset()

      formControl.resetDefaultValues(new Promise((resolve) => setTimeout(resolve)), true)

      await waitFor(() => expect(derivedFn).toHaveBeenCalledTimes(2))
    })

    test('notifies subscribers to isLoading twice and all other state once', async () => {
      const formControl = new FormControl()

      const isLoadingFn = vi.fn()
      const valuesFn = vi.fn()
      const defaultValuesFn = vi.fn()

      formControl.state.isLoading.subscribe(isLoadingFn)
      formControl.state.values.subscribe(valuesFn)
      formControl.state.defaultValues.subscribe(defaultValuesFn)

      isLoadingFn.mockReset()
      valuesFn.mockReset()
      defaultValuesFn.mockReset()

      formControl.resetDefaultValues(new Promise((resolve) => setTimeout(resolve)), true)

      await waitFor(() => expect(isLoadingFn).toHaveBeenCalledTimes(2))
      await waitFor(() => expect(valuesFn).toHaveBeenCalledOnce())
      await waitFor(() => expect(defaultValuesFn).toHaveBeenCalledOnce())
    })

    test('does not notify subscribers of derivedState if no values to reset', async () => {
      const formControl = new FormControl()

      formControl.derivedState.proxy.isLoading
      formControl.derivedState.proxy.values
      formControl.derivedState.proxy.defaultValues

      const derivedFn = vi.fn()

      formControl.derivedState.subscribe(derivedFn)

      derivedFn.mockReset()

      formControl.resetDefaultValues()

      await waitFor(() => expect(derivedFn).not.toHaveBeenCalled())
    })

    test('does not notify at all if no values to reset', async () => {
      const formControl = new FormControl()

      const isLoadingFn = vi.fn()
      const valuesFn = vi.fn()
      const defaultValuesFn = vi.fn()

      formControl.state.isLoading.subscribe(isLoadingFn)
      formControl.state.values.subscribe(valuesFn)
      formControl.state.defaultValues.subscribe(defaultValuesFn)

      isLoadingFn.mockReset()
      valuesFn.mockReset()
      defaultValuesFn.mockReset()

      formControl.resetDefaultValues()

      await waitFor(() => expect(isLoadingFn).not.toHaveBeenCalled())
      await waitFor(() => expect(valuesFn).not.toHaveBeenCalled())
      await waitFor(() => expect(defaultValuesFn).not.toHaveBeenCalled())
    })
  })
})
