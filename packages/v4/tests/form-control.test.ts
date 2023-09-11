import { describe, test, expect } from 'vitest'

import { FormControl } from '../src/form-control'

describe('create-form-control', () => {
  describe('get values', () => {
    test('no values', () => {
      const formControl = new FormControl()
      expect(formControl.getValues()).toEqual({})
    })

    const values = {
      name: 'Elysia',
      age: 18,
      a: {
        b: {
          c: {
            d: 'Hello',
          },
        },
      },
    }

    const formControl = new FormControl({ values })

    test('no key', () => {
      expect(formControl.getValues()).toEqual(values)
    })

    test('single key', () => {
      expect(formControl.getValues('a')).toEqual(values.a)
    })

    test('args keys', () => {
      expect(formControl.getValues('a', 'name', 'a.b.c')).toEqual([
        values.a,
        values.name,
        values.a.b.c,
      ])
    })

    test('array keys', () => {
      expect(formControl.getValues(['a.b.c.d', 'name'])).toEqual([values.a.b.c.d, values.name])
    })
  })
})
