import { describe, test, expectTypeOf } from 'vitest'

import type { DeepMap } from '../../../src/utils/types/deep-map'

describe('DeepPartial', () => {
  test('does not recur on explicit any', () => {
    expectTypeOf<DeepMap<any, boolean>>().toEqualTypeOf<any>()
  })

  test('nested any', () => {
    expectTypeOf<DeepMap<{ a: any }, boolean>>().toEqualTypeOf<{ a: boolean }>()
  })

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

  test('single layer object properties are mapped like interface mapping', () => {
    type MyType = {
      a: string
      b: number
      c: boolean
    }

    expectTypeOf<DeepMap<MyType, null>>().toEqualTypeOf<{ [K in keyof MyType]: null }>()
  })

  test('nested object properties', () => {
    type MyType = {
      a: string
      b: {
        c: number
        d: {
          e: boolean
        }
      }
    }

    expectTypeOf<DeepMap<MyType, boolean>>().toEqualTypeOf<{
      a: boolean
      b: {
        c: boolean
        d: {
          e: boolean
        }
      }
    }>()
  })
})
