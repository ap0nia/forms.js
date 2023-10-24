import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

import type { FieldErrors } from 'packages/core/src'

describe('FormControl', () => {
  describe('clearErrors', () => {
    test('resets all errors if no name provided', () => {
      const formControl = new FormControl()

      formControl.state.errors.set({
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors()

      const expectedErrors: FieldErrors = {}

      expect(formControl.state.errors.value).toEqual(expectedErrors)
    })

    test('resets error for single specified name', () => {
      const formControl = new FormControl()

      const name = 'test'

      formControl.state.errors.set({
        [name]: [],
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors(name)

      const expectedErrors: FieldErrors = {
        a: [],
        b: [],
        c: [],
      }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
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

      const expectedErrors: FieldErrors = { c: [] }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
    })

    describe('properly notifies subscribers to batched state', () => {
      test('only notifies subscribers once', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.batchedState.subscribe(fn, undefined, false)

        formControl.batchedState.proxy.errors

        formControl.clearErrors()

        expect(fn).toHaveBeenCalledOnce()
      })
    })
  })
})
