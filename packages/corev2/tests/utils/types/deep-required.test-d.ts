import { describe, test, expectTypeOf } from 'vitest'

import type { DeepRequired } from '../../../src/utils/types/deep-required'

describe('DeepPartial', () => {
  describe('any', () => {
    test('top-level any', () => {
      expectTypeOf<DeepRequired<any>>().toEqualTypeOf<any>()
    })
  })

  describe('makes properties in array-like types required', () => {
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
    test('simple', () => {
      type MyType = {
        a?: string
        b?: number
        c?: boolean
      }

      expectTypeOf<DeepRequired<MyType>>().toEqualTypeOf<{
        a: string
        b: number
        c: boolean
      }>()
    })

    test('nested', () => {
      type MyType = {
        a?: string
        b?: {
          c?: number
          d?: {
            e?: boolean
          }
        }
      }

      expectTypeOf<DeepRequired<MyType>>().toEqualTypeOf<{
        a: string
        b: {
          c: number
          d: {
            e: boolean
          }
        }
      }>()
    })
  })
})
