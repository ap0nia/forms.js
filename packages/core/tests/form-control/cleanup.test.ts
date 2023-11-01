import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('cleanup', () => {
    test('removes unmounted fields', () => {
      const formControl = new FormControl()

      const name = 'test'

      const field = {
        _f: {
          name,
          ref: { name },
        },
      }

      formControl.fields[name] = field

      formControl.names.unMount.add(name)

      formControl.cleanup()

      expect(formControl.fields[name]).toBeUndefined()
    })
  })
})
