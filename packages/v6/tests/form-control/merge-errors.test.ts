import type { FieldErrors } from 'packages/core/src/types/errors'
import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('mergeErrors', () => {
    test('errors are same if no names specified', () => {
      const formControl = new FormControl()

      const errors: FieldErrors = {
        a: {
          type: 'required',
        },
        'a.b': {
          type: 'minLength',
        },
        'a.b.c': {
          type: 'maxLength',
        },
      }

      formControl.mergeErrors(errors)

      const expectedErrors: FieldErrors = {
        a: {
          type: 'required',
          b: {
            type: 'minLength',
            c: {
              type: 'maxLength',
            },
          },
        },
      }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
    })

    test('errors are filtered if names specified', () => {
      const formControl = new FormControl()

      const errors: FieldErrors = {
        a: {
          type: 'required',
        },
        'a.b': {
          type: 'minLength',
        },
        'a.b.c': {
          type: 'maxLength',
        },
      }

      formControl.mergeErrors(errors, ['a.b'])

      const expectedErrors: FieldErrors = {
        a: {
          b: {
            type: 'minLength',
          },
        },
      }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
    })

    test('errors are unset if name specifies an absent error', () => {
      const formControl = new FormControl()

      // The form state has existing errors.
      formControl.state.errors.set({
        a: {
          type: 'validate',
        },
        b: {
          type: 'deps',
        },
        c: {
          type: 'value',
        },
      })

      // The new errors object to merge has no errors.
      const errors: FieldErrors = {}

      // If selectively merging errors, the existing errors should be unset.
      formControl.mergeErrors(errors, ['a', 'c'])

      const expectedErrors: FieldErrors = {
        b: {
          type: 'deps',
        },
      }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
    })
  })
})
