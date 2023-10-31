import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('updateDisabledField', () => {
    test('exit early and no values change if disabled is not a boolean', () => {
      const formControl = new FormControl()

      const originalValues = formControl.stores.values.value

      formControl.updateDisabledField({ name: 'name' })

      expect(formControl.stores.values.value).toEqual(originalValues)
    })

    test('sets field value to undefined if disabled is true', () => {
      const formControl = new FormControl()

      const name = 'name'

      formControl.stores.values.set({ [name]: 'value' })

      formControl.updateDisabledField({ disabled: true, name })

      expect(formControl.stores.values.value).toEqual({
        [name]: undefined,
      })
    })

    test('keeps field value same if disabled is false', () => {
      const formControl = new FormControl()

      const name = 'name'

      const values = { [name]: 'value' }

      formControl.stores.values.set(values)

      formControl.updateDisabledField({ disabled: false, name })

      expect(formControl.stores.values.value).toEqual(values)
    })

    test('falls back to using field value if disabled is false and no form values', () => {
      const formControl = new FormControl()

      const name = 'name'

      const value = 'value'

      formControl.updateDisabledField({
        disabled: false,
        name,
        field: {
          _f: {
            ref: { name },
            name,
            value,
          },
        },
      })

      expect(formControl.stores.values.value).toEqual({ [name]: value })
    })

    test('falls back to using value from fields if disabled is false and no form values', () => {
      const formControl = new FormControl()

      const name = 'name'

      const value = 'value'

      formControl.updateDisabledField({
        disabled: false,
        name,
        fields: {
          [name]: {
            _f: {
              ref: { name },
              name,
              value,
            },
          },
        },
      })

      expect(formControl.stores.values.value).toEqual({ [name]: value })
    })
  })
})
