import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('watch', () => {
    describe('properly handles function subscriptions', () => {
      test('notifies subscriber when the watched value changes', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.watch(fn)

        fn.mockReset()

        // Access a property so it's tracked.
        formControl.state.proxy.values

        // Update the tracked property.
        formControl.stores.values.set({ a: 123 })

        expect(fn).toHaveBeenCalled()
      })
    })

    describe('properly handles subscription to value changes for a single field name', () => {
      test('updates state when a similar name to the watched name changes', () => {
        const formControl = new FormControl()

        formControl.watch('a')

        const fn = vi.fn()

        formControl.state.subscribe(fn)

        fn.mockReset()

        // When state is updated with an unrelated context, don't update.
        formControl.stores.values.set({ a: 123 })

        expect(fn).not.toHaveBeenCalled()

        // When state is updated with a context similar to the one subscribed to, update.
        formControl.stores.values.set({ a: 123 }, ['abc'])

        expect(fn).toHaveBeenCalled()
      })

      test('updates state only when the exact field name was changed', () => {
        const formControl = new FormControl()

        formControl.watch('a', undefined, { exact: true })

        const fn = vi.fn()

        formControl.state.subscribe(fn)

        fn.mockReset()

        // Unrelated context, don't update.
        formControl.stores.values.set({ a: 123 })

        expect(fn).not.toHaveBeenCalled()

        // Don't update since it's not an exact match.
        formControl.stores.values.set({ a: 123 }, ['abc'])

        expect(fn).not.toHaveBeenCalled()

        // Exact match, update.
        formControl.stores.values.set({ a: 123 }, ['a'])

        expect(fn).toHaveBeenCalled()
      })

      test('updates state if changed field name exactly matches with any of multiple names', () => {
        const formControl = new FormControl()

        formControl.watch(['a', 'b', 'c'], undefined, { exact: true })

        const fn = vi.fn()

        formControl.state.subscribe(fn)

        fn.mockReset()

        // Unrelated context, don't update.
        formControl.stores.values.set({ a: 123 })

        expect(fn).not.toHaveBeenCalled()

        // Don't update since it's not an exact match.
        formControl.stores.values.set({ a: 123 }, ['abc'])

        expect(fn).not.toHaveBeenCalled()

        // Exact match with at least one name, update.
        formControl.stores.values.set({ a: 123 }, ['a'])

        expect(fn).toHaveBeenCalledTimes(1)

        // Exact match with at least one name, update.
        formControl.stores.values.set({ a: 123 }, ['b'])

        expect(fn).toHaveBeenCalledTimes(2)

        // Exact match with at least one name, update.
        formControl.stores.values.set({ a: 123 }, ['c'])

        expect(fn).toHaveBeenCalledTimes(3)
      })

      test('updates state to track changes to values when no keys specified', () => {
        const formControl = new FormControl()

        formControl.watch()

        expect(formControl.state.keys).toContain('values')
      })
    })

    describe('generates correct output', () => {
      test('uses the current values if the form control is mounted', () => {
        const formControl = new FormControl()

        formControl.stores.values.set({ a: { b: 123 } })
        formControl.stores.defaultValues.set({ a: { b: 456 } })

        formControl.mount()

        expect(formControl.watch('a.b')).toEqual(123)
      })

      describe('when unmounted', () => {
        test('uses the form control default values if not default values provided', () => {
          const formControl = new FormControl()

          formControl.stores.values.set({ a: { b: 123 } })
          formControl.stores.defaultValues.set({ a: { b: 456 } })

          expect(formControl.watch('a.b')).toEqual(456)
        })

        test('uses object with name set to default value if name is a string', () => {
          const formControl = new FormControl()

          formControl.stores.values.set({ a: { b: 123 } })
          formControl.stores.defaultValues.set({ a: { b: 456 } })

          expect(formControl.watch('a', { b: 789 })).toEqual({ b: 789 })
        })

        test('uses provided default value if name is not a string', () => {
          const formControl = new FormControl()

          formControl.stores.values.set({ a: { b: 123 } })
          formControl.stores.defaultValues.set({ a: { b: 456 } })

          expect(formControl.watch(['a'], { a: { b: 789 } })).toEqual({ b: 789 })
        })
      })
    })
  })
})
