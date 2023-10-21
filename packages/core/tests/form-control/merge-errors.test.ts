import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldErrors } from '../../src/types/errors'

describe('FormControl', () => {
  describe('mergeErrors', () => {
    test('merges all provided errors if no names are provided', () => {
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

    test('only sets errors for the names specified', () => {
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

    test('unsets errors for names that do not have an error', () => {
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

    test('adds field array errors to a root property', () => {
      const formControl = new FormControl()

      const name = 'a.b.c'

      formControl.names.array.add(name)

      const errors: FieldErrors = {
        [name]: {
          type: 'required',
        },
      }

      formControl.mergeErrors(errors)

      const expectedErrors: FieldErrors = {
        a: {
          b: {
            c: {
              root: {
                type: 'required',
              },
            },
          },
        },
      }

      expect(formControl.state.errors.value).toEqual(expectedErrors)
    })
  })
})
