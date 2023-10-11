import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('aliases', () => {
    test('fields is equal to _fields', () => {
      const form = new FormControl()

      expect(form.fields).toBe(form._fields)
    })
  })
})
