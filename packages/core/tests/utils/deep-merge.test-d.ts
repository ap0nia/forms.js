import { describe, test, expectTypeOf } from 'vitest'

import type { DeepMerge } from '../../src/utils/deep-merge'

describe('DeepMerge', () => {
  describe('correctly process explicit any', () => {
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

  describe('merges tuples', () => {
    test('naively merges tuples (i.e. not truly a deep merge)', () => {
      type Left = [string, number, boolean]

      type Right = [string, number, boolean]

      expectTypeOf<DeepMerge<Left, Right>>().toEqualTypeOf<[...Left, ...Right]>()
    })
  })

  test('deeply merges objects', () => {
    test('merging single depth objects is the same as intersecting them', () => {
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

    test('recursively merges properties of nested objects at all depths', () => {
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

    test('merging objects preserves the optional attribute', () => {
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

  describe('correctly processes unexpected types', () => {
    test('converts nullish values to empty objects', () => {
      expectTypeOf<DeepMerge<null, void>>().toMatchTypeOf<{}>()
    })

    test('merging an object with a nullish value returns the defined object', () => {
      type MyObject = {
        a: string
        b: number
      }

      expectTypeOf<DeepMerge<MyObject, null>>().toMatchTypeOf<MyObject>()
      expectTypeOf<DeepMerge<null, MyObject>>().toMatchTypeOf<MyObject>()
    })
  })
})
