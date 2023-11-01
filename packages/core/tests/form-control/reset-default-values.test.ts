import { waitFor } from '@testing-library/dom'
import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('resetDefaultValues', () => {
    test('does not change default values if provided values are null', async () => {
      const formControl = new FormControl()

      const values = {
        name: 'Hello, World!',
        foo: 'bar',
        baz: 'qux',
      }

      formControl.stores.defaultValues.set({ ...values })

      await formControl.resolveDefaultValues(null as any)

      expect(formControl.stores.defaultValues.value).toEqual(values)
    })

    test('does not change default values if provided function resolves to null', async () => {
      const formControl = new FormControl()

      const values = {
        name: 'Hello, World!',
        foo: 'bar',
        baz: 'qux',
      }

      formControl.stores.defaultValues.set({ ...values })

      await formControl.resolveDefaultValues(() => null as any)

      expect(formControl.stores.defaultValues.value).toEqual(values)
    })

    test('sets isLoading to true if provided function resolves to a promise', async () => {
      const formControl = new FormControl()

      // Subscribe to derived state to activate it.
      formControl.state.subscribe(() => {})
      formControl.state.proxy.isLoading

      formControl.resolveDefaultValues(async () => ({}))

      expect(formControl.stores.isLoading.value).toBeTruthy()
      expect(formControl.state.writable.value.isLoading).toBeTruthy()
    })

    test('sets default values to empty object if provided values is a promise that resolves to null', async () => {
      const formControl = new FormControl()

      await formControl.resolveDefaultValues(Promise.resolve(null as any))

      expect(formControl.stores.defaultValues.value).toEqual({})
    })

    describe('values and default values are the same if resetValues is true', () => {
      test('sets both to empty object for promise that resolves to null', async () => {
        const formControl = new FormControl()

        await formControl.resolveDefaultValues(Promise.resolve(null as any), true)

        expect(formControl.stores.defaultValues.value).toEqual({})
        expect(formControl.stores.values.value).toEqual({})
      })

      test('sets both to same provided values', async () => {
        const formControl = new FormControl()

        const values = {
          name: 'Hello, World!',
          foo: 'bar',
          baz: 'qux',
        }

        await formControl.resolveDefaultValues({ ...values }, true)

        expect(formControl.stores.defaultValues.value).toEqual(values)
        expect(formControl.stores.values.value).toEqual(values)
      })

      test('sets both to same resolved function result', async () => {
        const formControl = new FormControl()

        const values = {
          name: 'Hello, World!',
          foo: 'bar',
          baz: 'qux',
        }

        await formControl.resolveDefaultValues(() => values, true)

        expect(formControl.stores.defaultValues.value).toEqual(values)
        expect(formControl.stores.values.value).toEqual(values)
      })
    })

    describe('satisfies invariants', () => {
      test('sets isLoading twice for promise', async () => {
        const formControl = new FormControl()

        // Subscribe to derived state to activate it.
        formControl.state.subscribe(() => {})
        formControl.state.proxy.isLoading

        formControl.resolveDefaultValues(Promise.resolve({}))

        expect(formControl.stores.isLoading.value).toBeTruthy()

        await waitFor(() => expect(formControl.state.writable.value.isLoading).toBeFalsy())
      })

      test('updates state twice if tracking isLoading and promise is provided', async () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        // Subscribe to derived state to activate it.
        formControl.state.subscribe(fn)
        formControl.state.proxy.isLoading

        fn.mockClear()

        formControl.resolveDefaultValues(Promise.resolve({}))

        expect(formControl.state.writable.value.isLoading).toBeTruthy()

        await waitFor(() => expect(formControl.state.writable.value.isLoading).toBeFalsy())

        expect(fn).toHaveBeenCalledTimes(2)
      })

      test('sets isLoading twice if promise is provided', async () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.stores.isLoading.subscribe(fn)

        fn.mockClear()

        formControl.resolveDefaultValues(Promise.resolve({}))

        expect(formControl.stores.isLoading.value).toBeTruthy()

        await waitFor(() => expect(formControl.stores.isLoading.value).toBeFalsy())

        expect(fn).toHaveBeenCalledTimes(2)
      })
    })
  })
})
