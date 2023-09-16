import { describe, test, expectTypeOf } from 'vitest'

import type { DeepMerge } from '../../../src/utils/types/deep-merge'

describe('DeepMerge', () => {
  test('any if both are any', () => {
    expectTypeOf<DeepMerge<any, any>>().toEqualTypeOf<any>()
  })

  test('ignores top level any for left', () => {
    type Left = {
      a: string
      b: number
      c: boolean
    }
    expectTypeOf<DeepMerge<Left, any>>().toEqualTypeOf<Left>()
  })

  test('ignores top level any for left', () => {
    type Right = {
      a: string
      b: number
      c: boolean
    }
    expectTypeOf<DeepMerge<any, Right>>().toEqualTypeOf<Right>()
  })

  test('naively merges tuples', () => {
    type Left = [string, number, boolean]
    type Right = [string, number, boolean]

    expectTypeOf<DeepMerge<Left, Right>>().toEqualTypeOf<[...Left, ...Right]>()
  })

  test('single layer objects', () => {
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

    expectTypeOf<DeepMerge<Left, Right>>().toEqualTypeOf<Left & Right>()
  })

  test('nested objects', () => {
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

    expectTypeOf<DeepMerge<Left, Right>>().toEqualTypeOf<Expected>()
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
      b: number | undefined
      c:
        | {
            d: boolean
          }
        | undefined
    }

    expectTypeOf<DeepMerge<Left, Right>>().toEqualTypeOf<Expected>()
  })
})
