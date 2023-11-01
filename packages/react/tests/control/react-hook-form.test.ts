import { describe, test, expect } from 'vitest'

import { Control } from '../../src/control'

describe('control', () => {
  describe('react-hook-form', () => {
    test('returns fields when _fields getter is accessed', () => {
      const control = new Control()

      expect(control._fields).toBe(control.fields)
    })
  })
})
