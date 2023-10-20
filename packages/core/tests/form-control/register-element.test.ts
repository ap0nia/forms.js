import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { Field } from '../../src/types/fields'

describe('FormControl', () => {
  describe('registerElement', () => {
    test('properly sets the new field', () => {
      const formControl = new FormControl()

      const name = 'test'

      const ref = document.createElement('input')

      formControl.registerElement(name, ref)

      const field: Field = {
        _f: {
          mount: true,
          name,
          ref,
        },
      }

      expect(formControl.fields[name]).toEqual(field)
    })

    test('updates element value with default value if default value exists', () => {
      const name = 'hello'

      const formControl = new FormControl({
        defaultValues: {
          [name]: 'test',
        },
      })

      const ref = document.createElement('input')

      expect(ref.value).toEqual('')

      formControl.registerElement(name, ref)

      expect(ref.value).toEqual('test')
    })

    test('updates values with element value if default value does not exist', () => {
      const name = 'hello'

      const value = 'foobar'

      const ref = document.createElement('input')

      ref.value = value

      const formControl = new FormControl()

      formControl.registerElement(name, ref)

      expect(formControl.state.values.value[name]).toEqual(value)
    })

    test('updates values with element value if field is default checked', () => {
      const name = 'hello'

      const value = 'foobar'

      const ref = document.createElement('input')

      ref.defaultChecked = true
      ref.value = value

      const formControl = new FormControl()

      formControl.registerElement(name, ref)

      expect(formControl.state.values.value[name]).toEqual(value)
    })
  })
})
