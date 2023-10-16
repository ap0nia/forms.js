import { describe, test, expectTypeOf } from 'vitest'

import type { DeepPartial } from '../../src/utils/deep-partial'

describe('DeepPartial', () => {
  describe('any', () => {
    test('top-level any', () => {
      expectTypeOf<DeepPartial<any>>().toEqualTypeOf<any>()
    })
  })

  describe('makes properties in array-like types optional', () => {
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
    test('simple', () => {
      type MyType = {
        a: string
        b: number
        c: boolean
      }

      expectTypeOf<DeepPartial<MyType>>().toEqualTypeOf<{
        a?: string
        b?: number
        c?: boolean
      }>()
    })

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

      expectTypeOf<DeepPartial<MyType>>().toEqualTypeOf<{
        a?: string
        b?: {
          c?: number
          d?: {
            e?: boolean
          }
        }
      }>()
    })
  })
})
