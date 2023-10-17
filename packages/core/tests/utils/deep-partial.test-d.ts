import { describe, test, expectTypeOf } from 'vitest'

import type { DeepPartial } from '../../src/utils/deep-partial'

describe('DeepPartial', () => {
  describe('correctly processes explicit any', () => {
    test('returns any for top-level any', () => {
      expectTypeOf<DeepPartial<any>>().toEqualTypeOf<any>()
    })

    test('makes nested any properties optional', () => {
      expectTypeOf<DeepPartial<{ a: any }>>().toEqualTypeOf<{ a?: any }>()
    })
  })

  describe('makes all properties in array-like types optional', () => {
    test('array', () => {
      expectTypeOf<DeepPartial<string[]>>().toEqualTypeOf<(string | undefined)[]>()
      expectTypeOf<DeepPartial<number[]>>().toEqualTypeOf<(number | undefined)[]>()
      expectTypeOf<DeepPartial<boolean[]>>().toEqualTypeOf<(boolean | undefined)[]>()
    })

    test('tuple', () => {
      expectTypeOf<DeepPartial<[string, number, boolean]>>().toEqualTypeOf<
        [string?, number?, boolean?]
      >()
    })
  })

  test('works the same as built-in Partial for arrays and simple objects', () => {
    expectTypeOf<DeepPartial<string[]>>().toEqualTypeOf<Partial<string[]>>()
    expectTypeOf<DeepPartial<{ a: string }>>().toEqualTypeOf<Partial<{ a: string }>>()
  })

  describe('makes properties in objects optional', () => {
    test('all properties in a single depth object are optional', () => {
      type MyType = {
        a: string
        b: number
        c: boolean
      }

      type ExpectedType = {
        a?: string
        b?: number
        c?: boolean
      }

      expectTypeOf<DeepPartial<MyType>>().toEqualTypeOf<ExpectedType>()
    })

    test('all nested properties in an object are optional', () => {
      type MyType = {
        a: string
        b: {
          c: number
          d: {
            e: boolean
          }
        }
      }

      type ExpectedType = {
        a?: string
        b?: {
          c?: number
          d?: {
            e?: boolean
          }
        }
      }

      expectTypeOf<DeepPartial<MyType>>().toEqualTypeOf<ExpectedType>()
    })
  })
})
