import { describe, test, expect } from 'vitest'

import { Control } from '../../src/control'

describe('control', () => {
  describe('unregister', () => {
    test('unregisters field', () => {
      const control = new Control()

      const name = 'name'

      control.fields[name] = {
        _f: {
          name,
          ref: { name },
        },
      }

      control.unregister(name)

      expect(control.fields[name]).toBeUndefined()
    })
  })
})
