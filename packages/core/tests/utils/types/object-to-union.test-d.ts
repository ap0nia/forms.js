import { describe, test, expectTypeOf } from 'vitest'

import type { ObjectToUnion } from '../../../src/utils/types/object-to-union'

describe('ObjectToUnion', () => {
  describe('any', () => {
    test('does not recur on explicit any', () => {
      expectTypeOf<ObjectToUnion<any>>().toEqualTypeOf<any>()
    })

    test('any in object', () => {
      expectTypeOf<ObjectToUnion<{ a: any }>>().toEqualTypeOf<{ a: any }>()
    })

    test('any in array in object', () => {
      expectTypeOf<ObjectToUnion<{ a: any[] }>>().toMatchTypeOf<{ [x: `a.${number}`]: any }>()
    })
  })

  describe('array-like', () => {
    test('nested array', () => {
      type MyType = {
        a: string[]
        b: {
          c: number[]
        }
      }

      type Expected =
        | { a: string[] }
        | { [x: `a.${number}`]: string }
        | { b: { c: number[] } }
        | { 'b.c': number[] }
        | { [x: `b.c.${number}`]: number }

      expectTypeOf<ObjectToUnion<MyType>>().toMatchTypeOf<Expected>()
    })
  })

  describe('objects', () => {
    test('nested', () => {
      type MyType = {
        a: string
        b: {
          c: number
          d: {
            e: boolean
          }
        }
      }

      type Expected =
        | {
            a: string
          }
        | {
            'b.c': number
          }
        | {
            'b.d.e': boolean
          }
        | {
            'b.d': {
              e: boolean
            }
          }
        | {
            b: {
              c: number
              d: {
                e: boolean
              }
            }
          }

      expectTypeOf<ObjectToUnion<MyType>>().toEqualTypeOf<Expected>()
    })
  })
})
