import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldErrors } from '../../src/types/errors'

describe('FormControl', () => {
  describe('setError', () => {
    test('adds an error to the form control', () => {
      const formControl = new FormControl()

      const name = 'a.b.c'

      const errorType = 'min'

      formControl.setError(name, { type: errorType })

      const expectedErrors: FieldErrors = {
        a: {
          b: {
            c: {
              type: errorType,
            },
          },
        },
      }

      expect(formControl.stores.errors.value).toEqual(expectedErrors)
      expect(formControl.stores.isValid.value).toBeFalsy()
    })

    test('invokes focus method on field if shouldFocus is true', () => {
      const formControl = new FormControl()

      const name = 'a.b.c'

      const ref = document.createElement('input')
      ref.focus = vi.fn()

      formControl.fields[name] = {
        _f: {
          name: ref.name,
          ref,
        },
      }

      formControl.setError(name, { type: 'min' }, { shouldFocus: true })

      expect(ref.focus).toHaveBeenCalledOnce()
    })

    test('adds an error and the ref if the field exists', () => {
      const formControl = new FormControl()

      const name = 'a'

      const ref = document.createElement('input')
      ref.focus = vi.fn()

      formControl.fields[name] = {
        _f: {
          name: ref.name,
          ref,
        },
      }

      formControl.setError(name, { type: 'min' })

      const expectedErrors: FieldErrors = {
        a: {
          type: 'min',
          ref,
        },
      }

      expect(formControl.stores.errors.value).toEqual(expectedErrors)
    })

    describe('satisfies invariants', () => {
      test('updates errors once', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.stores.errors.subscribe(fn)

        fn.mockReset()

        formControl.setError('a', { type: 'min' })

        expect(fn).toHaveBeenCalledOnce()
      })

      test('updates state once', () => {
        const formControl = new FormControl()

        const fn = vi.fn()

        formControl.state.proxy.errors
        formControl.state.proxy.isValid
        formControl.state.subscribe(fn)

        fn.mockReset()

        formControl.setError('a', { type: 'min' })

        expect(fn).toHaveBeenCalledOnce()
      })
    })
  })
})
