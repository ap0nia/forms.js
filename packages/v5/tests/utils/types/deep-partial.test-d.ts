import { describe, test, expectTypeOf } from 'vitest'

import type { DeepPartial } from '../../../src/utils/types/deep-partial'

describe('DeepPartial', () => {
  test('does not handle explicit any', () => {
    expectTypeOf<DeepPartial<any>>().toEqualTypeOf<any>()
  })

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

  test('works the same as built-in Partial for arrays and single layer objects', () => {
    expectTypeOf<DeepPartial<string[]>>().toEqualTypeOf<Partial<string[]>>()
    expectTypeOf<DeepPartial<{ a: string }>>().toEqualTypeOf<Partial<{ a: string }>>()
  })

  test('single layer object', () => {
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

  test('nested object', () => {
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
