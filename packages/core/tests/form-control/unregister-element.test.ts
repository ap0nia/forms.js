import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldRecord } from '../../src/types/fields'

describe('FormControl', () => {
  describe('unregisterElement', () => {
    test('non existing field and no unregistering does not mutate fields or unmount names', () => {
      const formControl = new FormControl()

      formControl.unregisterElement('field')

      expect(formControl.fields).toEqual({})

      expect(formControl.names.unMount).toEqual(new Set())
    })

    test('existing field will have mount property set to false', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.register(name)

      const originalFields: FieldRecord = {
        [name]: {
          _f: {
            name,
            ref: { name },
            mount: true,
          },
        },
      }

      const afterFields: FieldRecord = {
        [name]: {
          _f: {
            name,
            ref: { name },
            mount: false,
          },
        },
      }

      expect(formControl.fields).toEqual(originalFields)

      formControl.unregisterElement(name)

      expect(formControl.fields).toEqual(afterFields)
    })
  })

  test('with unregistering, unmount names will be updated', () => {
    const formControl = new FormControl()

    const name = 'name'

    formControl.register(name)

    expect(formControl.names.unMount).toEqual(new Set())

    formControl.unregisterElement(name, { shouldUnregister: true })

    expect(formControl.names.unMount).toEqual(new Set([name]))
  })
})
