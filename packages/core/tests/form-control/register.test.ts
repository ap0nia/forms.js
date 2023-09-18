import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldRecord } from '../../src/logic/fields'

describe('FormContol', () => {
  describe('register', () => {
    test('field name is added to the mounted names set', () => {
      const formControl = new FormControl()

      formControl.register('name')

      expect(formControl.names.mount.has('name')).toBe(true)
    })

    test('new field is registered on the form control and updated when re-registered', () => {
      const formControl = new FormControl()

      formControl.register('name')

      const expectedFields1: FieldRecord = {
        name: {
          _f: {
            name: 'name',
            mount: true,
            ref: { name: 'name' },
          },
        },
      }

      expect(formControl.fields).toEqual(expectedFields1)

      formControl.register('name', { required: true })

      const expectedFields2: FieldRecord = {
        name: {
          _f: {
            name: 'name',
            mount: true,
            ref: { name: 'name' },
            required: true,
          },
        },
      }

      expect(formControl.fields).toEqual(expectedFields2)
    })
  })
})
