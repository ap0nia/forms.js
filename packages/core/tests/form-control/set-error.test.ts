import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'

import type { FieldErrors } from 'packages/core/src/types/errors'

describe('FormControl', () => {
  describe('setError', () => {
    test('adds an error to the form control', () => {
      const formControl = new FormControl()

      const name = 'a.b.c'

      const errorType = 'Aponia'

      formControl.setError(name, { type: errorType })

      const expectedErrors: FieldErrors = {
        a: {
          b: {
            c: {
              type: errorType,
              ref: undefined,
            },
          },
        },
      }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
      expect(formControl.state.isValid.value).toBeFalsy()
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
  })

  describe('mockSetError', () => {
    test('adds an error to the form control', () => {
      const formControl = new FormControl()

      const name = 'a.b.c'

      const errorType = 'Aponia'

      formControl.mockSetError(name, { type: errorType })

      const expectedErrors: FieldErrors = {
        a: {
          b: {
            c: {
              type: errorType,
              ref: undefined,
            },
          },
        },
      }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
      expect(formControl.state.isValid.value).toBeFalsy()
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

      formControl.mockSetError(name, { type: 'min' }, { shouldFocus: true })

      expect(ref.focus).toHaveBeenCalledOnce()
    })
  })
})
