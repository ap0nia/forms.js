import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { FieldRecord } from '../../src/types/fields'

describe('FormControl', () => {
  describe('registerElement', () => {
    test('registering a checkbox element that is already part of the field does nothing', () => {
      const formControl = new FormControl()

      const name = 'name'

      const element = document.createElement('input')
      element.type = 'checkbox'

      const fields: FieldRecord = {
        [name]: {
          _f: {
            name,
            ref: {
              name,
            },
            refs: [element],
          },
        },
      }

      formControl.fields = fields

      formControl.registerElement(name, element)

      // Fields should stay the same
      expect(formControl.fields).toEqual(fields)
    })

    test('registering an element with a default value sets the default value', () => {
      const name = 'name'

      const defaultValues = {
        [name]: 'value',
      }

      const formControl = new FormControl({
        shouldUnregister: true,
        defaultValues,
      })

      // For test coverage, force isValid to be tracked.
      formControl.derivedState.proxy.isValid

      // Since `shouldUnregister` is true, the initial values should be an empty object.
      expect(formControl.state.values.value).toEqual({})

      const element = document.createElement('input')

      formControl.registerElement(name, element)

      // After registering the element, the default value should be set in the form control's values.
      expect(formControl.state.values.value).toEqual(defaultValues)
    })
  })
})
