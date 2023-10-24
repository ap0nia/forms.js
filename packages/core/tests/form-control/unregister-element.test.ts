import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'
import type { Field } from '../../src/types/fields'

describe('FormControl', () => {
  describe('unregisterElement', () => {
    test('sets mount to false', () => {
      const formControl = new FormControl<{ name: string }>()

      const name = 'test'

      const field: Field = {
        _f: {
          mount: true,
          name,
          ref: { name },
        },
      }

      formControl.fields[name] = field

      formControl.unregisterElement(name)

      expect(field._f.mount).toBeFalsy()
    })

    test('adds name to unmount if not in mount set and shouldUnregister is true', () => {
      const formControl = new FormControl<{ name: string }>()

      const name = 'test'

      const field: Field = {
        _f: {
          mount: false,
          name,
          ref: { name },
        },
      }

      formControl.fields[name] = field

      formControl.unregisterElement(name, { shouldUnregister: true })

      expect(formControl.names.unMount).toContain(name)
    })
  })
})
