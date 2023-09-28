import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('setFieldValue', () => {
    test('setting value for existing, disabled field does not mutate the form values', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.register(name, { disabled: true })

      formControl.setFieldValue(name, 'Hello')

      expect(formControl.state.values.value).toEqual({})
    })

    test('setting value for existing, enabled field mutates the form values', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.register(name)

      formControl.setFieldValue(name, 'Hello')

      expect(formControl.state.values.value).toEqual({ [name]: 'Hello' })
    })

    test('setting a null value for an html element changes the field value to empty string', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.fields[name] = {
        _f: {
          name,
          ref: document.createElement('input'),
        },
      }

      formControl.setFieldValue(name, null)

      expect(formControl.fields[name]._f.ref.value).toEqual('')
    })
  })
})
