import { describe, test, expect } from 'vitest'

import { FormControl } from '../src/create-form-control'

describe('create-form-control', () => {
  describe('get values', () => {
    describe('no arguments', () => {
      test('with values', () => {
        const values = {
          a: {
            b: {
              c: 'd',
            },
          },
        }
        const formControl = new FormControl({ values })
        expect(formControl.getValues()).toEqual(values)
      })

      test('no values', () => {
        const formControl = new FormControl()
        expect(formControl.getValues()).toEqual({})
      })
    })
  })
})
