import { describe, test, expect } from 'vitest'

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

      formControl.state.defaultValues.set({ ...values })

      await formControl.resetDefaultValues(null as any)

      expect(formControl.state.defaultValues.value).toEqual(values)
    })

    test('does not change default values if provided function resolves to null', async () => {
      const formControl = new FormControl()

      const values = {
        name: 'Hello, World!',
        foo: 'bar',
        baz: 'qux',
      }

      formControl.state.defaultValues.set({ ...values })

      await formControl.resetDefaultValues(() => null as any)

      expect(formControl.state.defaultValues.value).toEqual(values)
    })

    test('sets isLoading to true if provided function resolves to a promise', async () => {
      const formControl = new FormControl()

      // Subscribe to derived state to activate it.
      formControl.derivedState.subscribe(() => {})
      formControl.derivedState.proxy.isLoading

      formControl.resetDefaultValues(async () => ({}))

      expect(formControl.state.isLoading.value).toBeTruthy()
      expect(formControl.derivedState.value.isLoading).toBeTruthy()
    })

    test('sets default values to empty object if provided values is a promise that resolves to null', async () => {
      const formControl = new FormControl()

      await formControl.resetDefaultValues(Promise.resolve(null as any))

      expect(formControl.state.defaultValues.value).toEqual({})
    })

    describe('values and default values are the same if resetValues is true', () => {
      test('sets both to empty object for promise that resolves to null', async () => {
        const formControl = new FormControl()

        await formControl.resetDefaultValues(Promise.resolve(null as any), true)

        expect(formControl.state.defaultValues.value).toEqual({})
        expect(formControl.state.values.value).toEqual({})
      })

      test('sets both to same provided values', async () => {
        const formControl = new FormControl()

        const values = {
          name: 'Hello, World!',
          foo: 'bar',
          baz: 'qux',
        }

        await formControl.resetDefaultValues({ ...values }, true)

        expect(formControl.state.defaultValues.value).toEqual(values)
        expect(formControl.state.values.value).toEqual(values)
      })

      test('sets both to same resolved function result', async () => {
        const formControl = new FormControl()

        const values = {
          name: 'Hello, World!',
          foo: 'bar',
          baz: 'qux',
        }

        await formControl.resetDefaultValues(() => values, true)

        expect(formControl.state.defaultValues.value).toEqual(values)
        expect(formControl.state.values.value).toEqual(values)
      })
    })
  })
})
