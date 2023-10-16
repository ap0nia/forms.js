import { describe, test, expectTypeOf } from 'vitest'

import type { DeepMerge } from '../../src/utils/deep-merge'

describe('DeepMerge', () => {
  describe('correctly handles any', () => {
    test('returns any if both input types are any', () => {
      expectTypeOf<DeepMerge<any, any>>().toEqualTypeOf<any>()
    })

    test('returns left if right is any', () => {
      type Left = {
        a: string
        b: number
        c: boolean
      }
      expectTypeOf<DeepMerge<Left, any>>().toEqualTypeOf<Left>()
    })

    test('returns right if left is any', () => {
      type Right = {
        a: string
        b: number
        c: boolean
      }
      expectTypeOf<DeepMerge<any, Right>>().toEqualTypeOf<Right>()
    })
  })

  describe('tuples', () => {
    test('naively merges tuples', () => {
      type Left = [string, number, boolean]
      type Right = [string, number, boolean]

      expectTypeOf<DeepMerge<Left, Right>>().toEqualTypeOf<[...Left, ...Right]>()
    })
  })

  test('objects', () => {
    test('simple', () => {
      type Left = {
        a: string
        b: number
        c: boolean
      }
      type Right = {
        a: string
        b: number
        c: boolean
      }

      expectTypeOf<DeepMerge<Left, Right>>().toMatchTypeOf<Left & Right>()
    })

    test('nested', () => {
      type Left = {
        a: {
          b: string
          c: {
            d: boolean
          }
        }
      }

      type Right = {
        a: {
          c: {
            e: number
          }
        }
      }

      type Expected = {
        a: {
          b: string
          c: {
            d: boolean
            e: number
          }
        }
      }

      expectTypeOf<DeepMerge<Left, Right>>().toMatchTypeOf<Expected>()
    })

    /**
     * FIXME: doesn't preserve question mark optional properties.
     */
    test('preserves optional properties ... sort of', () => {
      type Left = {
        a: string
        b?: number
      }

      type Right = {
        a: string
        c?: {
          d: boolean
        }
      }

      type Expected = {
        a: string
        b?: number
        c?: {
          d: boolean
        }
      }

      expectTypeOf<DeepMerge<Left, Right>>().toMatchTypeOf<Expected>()
    })
  })
})
