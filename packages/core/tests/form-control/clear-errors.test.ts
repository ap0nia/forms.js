import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('clearErrors', () => {
    test('resets all errors if no name provided', () => {
      const formControl = new FormControl()

      formControl.state.errors.set({ test: [] })

      formControl.clearErrors()

      expect(formControl.state.errors.value).toEqual({})
    })

    test('resets error for one specified name', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.state.errors.set({
        [name]: [],
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors(name)

      expect(formControl.state.errors.value).toEqual({
        a: [],
        b: [],
        c: [],
      })
    })

    test('resets errors for multiple specified names', () => {
      const formControl = new FormControl()

      const names = ['test', 'a', 'b']

      formControl.state.errors.set({
        test: [],
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors(names)

      expect(formControl.state.errors.value).toEqual({
        c: [],
      })
    })

    describe('meets invariants', () => {
      test('only updates errors once', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.state.errors.subscribe(fn)

        fn.mockReset()

        formControl.clearErrors()

        expect(fn).toHaveBeenCalledOnce()
      })

      test('only updates derived state once', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.batchedState.subscribe(fn)

        // Track errors with the derived state.
        formControl.batchedState.proxy.errors

        fn.mockReset()

        formControl.clearErrors()

        expect(fn).toHaveBeenCalledOnce()
      })
    })
  })
})
