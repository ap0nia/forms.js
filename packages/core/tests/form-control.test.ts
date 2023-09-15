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

    test('values but unregister', () => {
      const formControl = new FormControl({ values, shouldUnregister: true })
      expect(formControl.getValues()).toEqual({})
    })

    describe('set values', () => {
      test('no key', () => {
        const formControl = new FormControl({ values })
        expect(formControl.getValues()).toEqual(values)
      })

      test('single key', () => {
        const formControl = new FormControl({ values })
        expect(formControl.getValues('a')).toEqual(values.a)
      })

      test('args keys', () => {
        const formControl = new FormControl({ values })
        expect(formControl.getValues('a', 'name', 'a.b.c')).toEqual([
          values.a,
          values.name,
          values.a.b.c,
        ])
      })

      test('array keys', () => {
        const formControl = new FormControl({ values })
        expect(formControl.getValues(['a.b.c.d', 'name'])).toEqual([values.a.b.c.d, values.name])
      })
    })
  })

  describe('register', () => {
    const formControl = new FormControl()

    test('returns correct props', () => {
      const props = undefined
      expect(formControl.register()).toEqual(props)
    })
  })
})
