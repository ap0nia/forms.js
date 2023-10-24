import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldErrors } from '../../src/types/errors'

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

      formControl.state.errors.set({
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors('c')

      const expectedErrors: FieldErrors = {
        a: [],
        b: [],
      }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
    })

    test('resets errors for multiple specified names', () => {
      const formControl = new FormControl()

      formControl.state.errors.set({
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors(['a', 'b'])

      const expectedErrors: FieldErrors = { c: [] }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
    })

    describe('satisfies invariants', () => {
      describe('notifies subscribers to batched state at most twice', () => {
        test('only notifies subscribers to batched state once', () => {
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
})
