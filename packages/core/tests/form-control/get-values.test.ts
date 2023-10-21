import { describe, test, expect } from 'vitest'

import { FormControl } from '../../src/form-control'

describe('FormContol', () => {
  describe('getValues', () => {
    const values = {
      name: 'name',
      age: 18,
      a: {
        b: {
          c: {
            d: 'Hello',
          },
        },
      },
    }

    describe('returns empty object under certain conditions', () => {
      test('returns empty object on mount when no values are provided', () => {
        const formControl = new FormControl()

        expect(formControl.getValues()).toEqual({})
      })

      test('returns empty object on mount when shouldUnregister is true regardless of whether values are provided', () => {
        const formControl = new FormControl({
          values: structuredClone(values),
          shouldUnregister: true,
        })

        expect(formControl.getValues()).toEqual({})
      })
    })

    describe('returns correct values when values is explicitly set', () => {
      test('returns entire values object when no key is provided', () => {
        const formControl = new FormControl({ values: structuredClone(values) })

        expect(formControl.getValues()).toEqual(values)
      })

      test('returns value of a single property when one key is provided', () => {
        const formControl = new FormControl({ values: structuredClone(values) })

        expect(formControl.getValues('a')).toEqual(values.a)
      })

      test('returns array of values when multiple keys are provided as rest arguments', () => {
        const formControl = new FormControl({ values: structuredClone(values) })

        expect(formControl.getValues('a', 'name', 'a.b.c')).toEqual([
          values.a,
          values.name,
          values.a.b.c,
        ])
      })

      test('returns array of values when multiple keys are provided as an array', () => {
        const formControl = new FormControl({ values: structuredClone(values) })

        expect(formControl.getValues(['a.b.c.d', 'name'])).toEqual([values.a.b.c.d, values.name])
      })
    })
  })
})
