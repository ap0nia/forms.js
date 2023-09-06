import { describe, test, expectTypeOf } from 'vitest'

import type { FlattenObject } from '../../src/type-utils/flatten-object'

describe('flatten', () => {
  test('one layer, one property', () => {
    type Input = { a: string }
    type Output = { a: string }

    expectTypeOf<Output>().toEqualTypeOf<FlattenObject<Input>>()
  })

  test('one layer, multiple properties', () => {
    type Input = { a: string; b: string; c: string }
    type Output = { a: string; b: string; c: string }

    expectTypeOf<Output>().toEqualTypeOf<FlattenObject<Input>>()
  })

  test('multiple layers, multiple properties', () => {
    type Input = {
      a: string
      b: {
        c: number
      }
      d: {
        e: {
          f: boolean
        }
      }
    }

    type Output = {
      a: string
      b: {
        c: number
      }
      'b.c': number
      d: {
        e: {
          f: boolean
        }
      }
      'd.e': {
        f: boolean
      }
      'd.e.f': boolean
    }

    expectTypeOf<FlattenObject<Input>>().toEqualTypeOf<Output>()
  })
})
