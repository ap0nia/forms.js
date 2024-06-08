import { describe, test, expectTypeOf } from 'vitest'

import type { DeepMap } from '../../src/utils/deep-map'

describe('DeepMap', () => {
  describe('correctly processes explicit any', () => {
    test('returns any for top-level explicit any', () => {
      expectTypeOf<DeepMap<any, boolean>>().toEqualTypeOf<any>()
    })

    test('returns the property mapped to the new type for nested any', () => {
      expectTypeOf<DeepMap<{ a: any }, boolean>>().toEqualTypeOf<{ a: boolean }>()
    })
  })

  describe('converts all elements in array-like types to the new type', () => {
    test('array', () => {
      expectTypeOf<DeepMap<string[], boolean>>().toEqualTypeOf<boolean[]>()
      expectTypeOf<DeepMap<number[], string>>().toEqualTypeOf<string[]>()
      expectTypeOf<DeepMap<boolean[], number>>().toEqualTypeOf<number[]>()
    })

    test('tuple', () => {
      expectTypeOf<DeepMap<[string, number, boolean], Symbol>>().toEqualTypeOf<
        [Symbol, Symbol, Symbol]
      >()
    })
  })

  describe('converts object properties to the new type if not a nested object', () => {
    test('mapping an object of depth 1 is synonymous with interface mapping', () => {
      type MyType = {
        a: string
        b: number
        c: boolean
      }

      expectTypeOf<DeepMap<MyType, null>>().toEqualTypeOf<{ [K in keyof MyType]: null }>()
    })

    test('maps nested object properties to the new type', () => {
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
        a: boolean
        b: {
          c: boolean
          d: {
            e: boolean
          }
        }
      }

      expectTypeOf<DeepMap<MyType, boolean>>().toEqualTypeOf<ExpectedType>()
    })

    /**
     * @see {@type NonRecord} for documentation on edge cases.
     */
    test('handles edge cases', () => {
      type MyType = {
        1: (...args: any[]) => any
        2: Set<any>
        3: Date
        4: BigInt
        5: Map<any, any>
        6: any[]
      }

      type ExpectedType = {
        1: boolean
        2: boolean
        3: boolean
        4: boolean
        5: boolean
        6: boolean
      }

      expectTypeOf<DeepMap<MyType, boolean>>().toEqualTypeOf<ExpectedType>()
    })
  })

  describe('correctly processes unexpected types', () => {
    test('converts nullish types to the indicated type', () => {
      type Nullish = null | undefined | never | unknown

      expectTypeOf<DeepMap<Nullish, boolean>>().toEqualTypeOf<boolean>()
    })

    test('converts primitive types to the indicated type', () => {
      type Primitive = string | number | boolean | bigint | symbol

      expectTypeOf<DeepMap<Primitive, boolean>>().toEqualTypeOf<boolean>()
    })
  })
})
