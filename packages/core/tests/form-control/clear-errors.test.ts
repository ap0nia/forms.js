import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldErrors } from '../../src/types/errors'

describe('FormControl', () => {
  describe('clearErrors', () => {
    test('resets all errors if no name provided', () => {
      const formControl = new FormControl()

      formControl.stores.errors.set({
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors()

      const expectedErrors: FieldErrors = {}

      expect(formControl.stores.errors.value).toEqual(expectedErrors)
    })

    test('resets error for single specified name', () => {
      const formControl = new FormControl()

      formControl.stores.errors.set({
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors('c')

      const expectedErrors: FieldErrors = {
        a: [],
        b: [],
      }

      expect(formControl.stores.errors.value).toEqual(expectedErrors)
    })

    test('resets errors for multiple specified names', () => {
      const formControl = new FormControl()

      formControl.stores.errors.set({
        a: [],
        b: [],
        c: [],
      })

      formControl.clearErrors(['a', 'b'])

      const expectedErrors: FieldErrors = { c: [] }

      expect(formControl.stores.errors.value).toEqual(expectedErrors)
    })

    describe('satisfies invariants', () => {
      test('updates state once', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.state.subscribe(fn, undefined, false)

        formControl.state.proxy.errors

        formControl.clearErrors()

        expect(fn).toHaveBeenCalledOnce()
      })
    })
  })
})
