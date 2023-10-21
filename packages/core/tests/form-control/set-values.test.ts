import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('setValues', () => {
    test('primitive value gets set', () => {
      const formControl = new FormControl()

      const name0 = 'abc'
      const name1 = 'def'

      const ref = document.createElement('input')

      formControl.fields[name0] = {
        [name1]: {
          _f: {
            name: ref.name,
            ref,
          },
        },
      }

      const value = 'Hello, World'

      formControl.setValues(name0, { [name1]: value })

      expect(ref.value).toEqual(value)
    })

    test('safely skips fields with missing reference', () => {
      const formControl = new FormControl()

      const name0 = 'abc'
      const name1 = 'def'
      const name2 = 'ghi'

      const ref = document.createElement('input')

      formControl.fields[name0] = {
        [name1]: {
          [name2]: {
            _f: {
              name: ref.name,
              ref,
            },
          },
        },
      }

      const value = 'Hello, World'

      formControl.setValues(name0, { [name1]: { [name2]: value } })

      expect(ref.value).toEqual(value)
    })
  })
})
