import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('watch', () => {
    describe('function subscription', () => {
      test('works', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.watch(fn)

        fn.mockReset()

        // Access a property so it's tracked.
        formControl.derivedState.proxy.values

        // Update the tracked property.
        formControl.state.values.set({ a: 123 })

        expect(fn).toHaveBeenCalled()
      })
    })

    describe('subscribe to derived store', () => {
      test('loose match for single', () => {
        const formControl = new FormControl()

        formControl.watch('a')

        const fn = vi.fn()

        formControl.derivedState.subscribe(fn)

        fn.mockReset()

        // When state is updated with an unrelated context, don't update.
        formControl.state.values.set({ a: 123 })

        expect(fn).not.toHaveBeenCalled()

        // When state is updated with a context similar to the one subscribed to, update.
        formControl.state.values.set({ a: 123 }, ['abc'])

        expect(fn).toHaveBeenCalled()
      })

      test('exact match for single name', () => {
        const formControl = new FormControl()

        formControl.watch('a', undefined, { exact: true })

        const fn = vi.fn()

        formControl.derivedState.subscribe(fn)

        fn.mockReset()

        // Unrelated context, don't update.
        formControl.state.values.set({ a: 123 })

        expect(fn).not.toHaveBeenCalled()

        // Don't update since it's not an exact match.
        formControl.state.values.set({ a: 123 }, ['abc'])

        expect(fn).not.toHaveBeenCalled()

        // Exact match, update.
        formControl.state.values.set({ a: 123 }, ['a'])

        expect(fn).toHaveBeenCalled()
      })

      test('exact match for multiple names', () => {
        const formControl = new FormControl()

        formControl.watch(['a', 'b', 'c'], undefined, { exact: true })

        const fn = vi.fn()

        formControl.derivedState.subscribe(fn)

        fn.mockReset()

        // Unrelated context, don't update.
        formControl.state.values.set({ a: 123 })

        expect(fn).not.toHaveBeenCalled()

        // Don't update since it's not an exact match.
        formControl.state.values.set({ a: 123 }, ['abc'])

        expect(fn).not.toHaveBeenCalled()

        // Exact match with at least one name, update.
        formControl.state.values.set({ a: 123 }, ['a'])

        expect(fn).toHaveBeenCalledTimes(1)

        // Exact match with at least one name, update.
        formControl.state.values.set({ a: 123 }, ['b'])

        expect(fn).toHaveBeenCalledTimes(2)

        // Exact match with at least one name, update.
        formControl.state.values.set({ a: 123 }, ['c'])

        expect(fn).toHaveBeenCalledTimes(3)
      })
    })
  })
})
