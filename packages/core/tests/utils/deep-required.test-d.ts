import { describe, test, expectTypeOf } from 'vitest'

import type { DeepRequired } from '../../src/utils/deep-required'

describe('DeepPartial', () => {
  describe('correctly processes explicit any', () => {
    test('returns any for top-level any', () => {
      expectTypeOf<DeepRequired<any>>().toEqualTypeOf<any>()
    })

    test('makes nested any properties required', () => {
      expectTypeOf<DeepRequired<{ a?: any }>>().toEqualTypeOf<{ a: any }>()
    })
  })

  describe('makes all properties in array-like types required', () => {
    test('array', () => {
      expectTypeOf<DeepRequired<(string | undefined)[]>>().toEqualTypeOf<string[]>()
      expectTypeOf<DeepRequired<(number | undefined)[]>>().toEqualTypeOf<number[]>()
      expectTypeOf<DeepRequired<(boolean | undefined)[]>>().toEqualTypeOf<boolean[]>()
    })

    test('tuple', () => {
      expectTypeOf<DeepRequired<[string?, number?, boolean?]>>().toEqualTypeOf<
        [string, number, boolean]
      >()
    })
  })

  test('works the same as built-in Required for arrays and simple objects', () => {
    expectTypeOf<DeepRequired<string[]>>().toEqualTypeOf<Required<string[]>>()
    expectTypeOf<DeepRequired<{ a: string }>>().toEqualTypeOf<Required<{ a: string }>>()
  })

  describe('makes properties in objects required', () => {
    test('makes all properties in a single depth object required', () => {
      type MyType = {
        a?: string
        b?: number
        c?: boolean
      }

      type ExpectedType = {
        a: string
        b: number
        c: boolean
      }

      expectTypeOf<DeepRequired<MyType>>().toEqualTypeOf<ExpectedType>()
    })

    test('makes all nested properties required', () => {
      type MyType = {
        a?: string
        b?: {
          c?: number
          d?: {
            e?: boolean
          }
        }
      }

      type ExpectedType = {
        a: string
        b: {
          c: number
          d: {
            e: boolean
          }
        }
      }

      expectTypeOf<DeepRequired<MyType>>().toEqualTypeOf<ExpectedType>()
    })
  })
})
