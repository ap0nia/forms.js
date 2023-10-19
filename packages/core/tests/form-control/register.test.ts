import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldRecord } from '../../src/types/fields'

describe('FormContol', () => {
  describe('register', () => {
    test('registering field with value', () => {
      const formControl = new FormControl()

      const name = 'name'

      const value = 'value'

      formControl.registerField(name, { value })

      expect(formControl.state.values.value[name]).toBe(value)
    })

    test('field name is added to the mounted names set', () => {
      const formControl = new FormControl()

      formControl.registerField('name')

      expect(formControl.names.mount.has('name')).toBe(true)
    })

    test('new field is registered on the form control and updated when re-registered', () => {
      const formControl = new FormControl()

      formControl.registerField('name')

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

      formControl.registerField('name', { required: true })

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

  describe('register result', () => {
    test('updates fields when registering an HTML element', () => {
      const formControl = new FormControl()

      const name = 'abc'
      formControl.registerField(name)

      const initialFields: FieldRecord = {
        [name]: {
          _f: {
            name,
            ref: { name },
            mount: true,
          },
        },
      }

      expect(formControl.fields).toEqual(initialFields)

      const ref = document.createElement('input')

      formControl.registerElement(name, ref)

      const expectedFields: FieldRecord = {
        [name]: {
          _f: {
            name,
            ref,
            mount: true,
          },
        },
      }

      expect(formControl.fields).toEqual(expectedFields)
    })

    test('adds name to unMount when unregistering an HTML element', () => {
      const formControl = new FormControl({ shouldUnregister: true })

      const name = 'abc'

      formControl.registerField(name)

      const initialFields: FieldRecord = {
        [name]: {
          _f: {
            name,
            ref: { name },
            mount: true,
          },
        },
      }

      expect(formControl.fields).toEqual(initialFields)
      expect(formControl.names.unMount).not.toContain(name)

      formControl.unregisterElement(name)

      const expectedFields: FieldRecord = {
        [name]: {
          _f: {
            name,
            ref: { name },
            mount: false,
          },
        },
      }

      expect(formControl.fields).toEqual(expectedFields)
      expect(formControl.names.unMount).toContain(name)
    })
  })
})
