import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('getDirty', () => {
    test('returns false if values are deeply equal to default values', () => {
      const formControl = new FormControl()

      formControl.state.values.set({
        foo: 'bar',
        baz: {
          qux: 'quux',
        },
      })

      formControl.state.defaultValues.set({
        foo: 'bar',
        baz: {
          qux: 'quux',
        },
      })

      expect(formControl.getDirty()).toBeFalsy()
    })

    test('returns true if values are not deeply equal to default values', () => {
      const formControl = new FormControl()

      formControl.state.values.set({
        foo: 'bar',
        baz: {
          qux: 'quux',
        },
      })

      formControl.state.defaultValues.set({
        foo: 'bar',
        baz: {
          qux: 'quux',
        },
      })

      const fn = vi.fn()

      formControl.batchedState.subscribe(fn, undefined, false)

      formControl.getDirty()

      expect(fn).not.toHaveBeenCalled()
    })

    describe('satisfies invariants', () => {
      describe('notifies subscribers to batched state at most twice', () => {
        test('does not notify subscribers to batched state when not dirty', () => {
          const formControl = new FormControl()

          formControl.state.values.set({
            foo: 'bar',
            baz: {
              qux: 'quux',
            },
          })

          formControl.state.defaultValues.set({
            foo: 'bar',
          })

          const fn = vi.fn()

          formControl.batchedState.subscribe(fn, undefined, false)

          formControl.getDirty()

          expect(fn).not.toHaveBeenCalled()
        })
        test('does not notify subscribers to batched state when dirty', () => {
          const formControl = new FormControl()

          formControl.state.values.set({
            foo: 'bar',
            baz: {
              qux: 'quux',
            },
          })

          formControl.state.defaultValues.set({
            foo: 'bar',
            baz: {},
          })

          const fn = vi.fn()

          formControl.batchedState.subscribe(fn, undefined, false)

          formControl.getDirty()

          expect(fn).not.toHaveBeenCalled()
        })
      })
    })
  })
})
