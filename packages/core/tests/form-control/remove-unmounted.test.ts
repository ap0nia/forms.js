import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldRecord } from '../../src/types/fields'

describe('FormControl', () => {
  describe('removeUnmounted', () => {
    test('removes existing fields that are not live', () => {
      const formControl = new FormControl()

      const name = 'name'

      const ref = document.createElement('input')

      // Since ref hasn't been attached to the document body, it isn't live.

      formControl.fields = {
        [name]: {
          _f: {
            name,
            ref,
          },
        },
      }

      formControl.names.unMount.add(name)

      formControl.removeUnmounted()

      expect(formControl.fields).toEqual({})
    })

    test('does not remove field if children refs are live', () => {
      const formControl = new FormControl()

      const name = 'name'

      // Since ref hasn't been attached to the document body, it isn't live.
      const ref = document.createElement('input')

      // These refs are live though, so they prevent the field from being removed.
      const refs = [document.createElement('input'), document.createElement('input')]

      refs.forEach((ref) => {
        document.body.appendChild(ref)
      })

      formControl.fields = {
        [name]: {
          _f: {
            name,
            ref,
            refs,
          },
        },
      }

      formControl.names.unMount.add(name)

      formControl.removeUnmounted()

      const fields: FieldRecord = {
        [name]: {
          _f: {
            name,
            ref,
            refs,
          },
        },
      }

      expect(formControl.fields).toEqual(fields)
    })
  })
})
