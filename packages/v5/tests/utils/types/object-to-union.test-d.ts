import { describe, test, expectTypeOf } from 'vitest'

import type { ObjectToUnion } from '../../../src/utils/types/object-to-union'

describe('ObjectToUnion', () => {
  test('does not recur on explicit any', () => {
    expectTypeOf<ObjectToUnion<any>>().toEqualTypeOf<any>()
  })

  test('nested any', () => {
    expectTypeOf<ObjectToUnion<{ a: any }>>().toEqualTypeOf<{ a: any }>()
  })

  test('nested any array', () => {
    expectTypeOf<ObjectToUnion<{ a: any[] }>>().toEqualTypeOf<{ a: any[] }>()
  })

  test('nested array', () => {
    type MyType = {
      a: string[]
      b: {
        c: number[]
      }
    }

    type Expected = { a: string[] } | { b: { c: number[] } } | { 'b.c': number[] }

    expectTypeOf<ObjectToUnion<MyType>>().toEqualTypeOf<Expected>()
  })

  test('nested object', () => {
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
