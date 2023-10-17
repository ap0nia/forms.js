import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormControl', () => {
  describe('react-hook-form interop', () => {
    describe('aliases', () => {
      test('fields is equal to react-hook-form _fields property', () => {
        const form = new FormControl()

        expect(form.fields).toBe(form._fields)
      })
    })
  })
})
