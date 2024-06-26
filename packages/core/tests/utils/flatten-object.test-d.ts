import { describe, test, expectTypeOf } from 'vitest'

import type { FlattenObject } from '../../src/utils/flatten-object'

describe('FlattenObject', () => {
  test('nullish types become empty object', () => {
    type Nullish = null | undefined | never | unknown
    expectTypeOf<FlattenObject<Nullish>>().toEqualTypeOf<NonNullable<unknown>>()
  })

  test('primitive types become empty object', () => {
    type Primitive = string | number | boolean | bigint | symbol
    expectTypeOf<FlattenObject<Primitive>>().toEqualTypeOf<NonNullable<unknown>>()
  })

  describe('objects', () => {
    test('simple', () => {
      type SingleLayer = { a: string }
      expectTypeOf<FlattenObject<SingleLayer>>().toEqualTypeOf<SingleLayer>()
    })

    test('nested', () => {
      type Nested = {
        a: {
          b: string
          c: {
            d: number
          }
        }
        e: boolean
      }

      type Expected = {
        'a.b': string
        'a.c.d': number
        'a.c': {
          d: number
        }
        a: {
          b: string
          c: {
            d: number
          }
        }
        e: boolean
      }

      expectTypeOf<FlattenObject<Nested>>().toEqualTypeOf<Expected>()
    })

    test('nested object with array', () => {
      type Nested = {
        a: {
          b: string
          c: {
            d: number[]
          }
        }
        e: string[]
        g: {
          h: boolean[]
        }
      }

      type Expected = {
        [x: `a.c.d.${number}`]: number
        [x: `e.${number}`]: string
        [x: `g.h.${number}`]: boolean
        'a.b': string
        'a.c.d': number[]
        'a.c': {
          d: number[]
        }
        'g.h': boolean[]
        g: {
          h: boolean[]
        }
        a: {
          b: string
          c: {
            d: number[]
          }
        }
        e: string[]
      }

      expectTypeOf<FlattenObject<Nested>>().toEqualTypeOf<Expected>()
    })
  })

  /**
   * @see {@type NonRecord} for documentation on edge cases.
   *
   * None of these types should be recurred into, so assert that the type is the same.
   */
  test('handles edge cases', () => {
    type MyType = {
      a: (...args: any[]) => any
      b: Set<any>
      c: Date
      d: BigInt
      e: Map<any, any>
      f: any[]
    }

    expectTypeOf<FlattenObject<MyType>>().toEqualTypeOf<MyType>()
  })
})
