import { describe, test, expectTypeOf } from 'vitest'

import type { FlattenObject } from '../../../src/utils/types/flatten-object'

describe('FlattenObject', () => {
  test('nullish types become empty object', () => {
    type Nullish = null | undefined | never | unknown
    expectTypeOf<FlattenObject<Nullish>>().toEqualTypeOf<NonNullable<unknown>>()
  })

  test('primitive types become empty object', () => {
    type Primitive = string | number | boolean | bigint | symbol
    expectTypeOf<FlattenObject<Primitive>>().toEqualTypeOf<NonNullable<unknown>>()
  })

  test('single layer object is the same', () => {
    type SingleLayer = { a: string }
    expectTypeOf<FlattenObject<SingleLayer>>().toEqualTypeOf<SingleLayer>()
  })

  test('nested object', () => {
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
})
