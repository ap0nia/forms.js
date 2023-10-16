import { describe, test, expectTypeOf } from 'vitest'

import type { IsAny } from '../../../src/utils/types/is-any'

describe('isAny', () => {
  test('returns true for explicit any', () => {
    expectTypeOf<IsAny<any>>().toMatchTypeOf<true>()
  })

  test('returns true for union with any', () => {
    expectTypeOf<IsAny<any | 1>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | 'a'>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | object>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | []>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | (() => void)>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | symbol>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | null>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | undefined>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | unknown>>().toMatchTypeOf<true>()
    expectTypeOf<IsAny<any | never>>().toMatchTypeOf<true>()
  })

  test('returns true for indexed type is any', () => {
    expectTypeOf<Record<string, any>[string]>().toMatchTypeOf<true>()
    expectTypeOf<any[][number]>().toMatchTypeOf<true>()
    expectTypeOf<[any][0]>().toMatchTypeOf<true>()
  })

  describe('returns false for primitive type', () => {
    test('boolean', () => {
      expectTypeOf<IsAny<boolean>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<true>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<false>>().toMatchTypeOf<false>()
    })

    test('number', () => {
      expectTypeOf<IsAny<number>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<0>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<1>>().toMatchTypeOf<false>()
    })

    test('string', () => {
      expectTypeOf<IsAny<string>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<''>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<'a'>>().toMatchTypeOf<false>()
    })

    test('object', () => {
      expectTypeOf<IsAny<object>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<{}>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<{ a: 1 }>>().toMatchTypeOf<false>()
    })
    test('array', () => {
      expectTypeOf<IsAny<any[]>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<[]>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<[1]>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<[1, 2]>>().toMatchTypeOf<false>()
    })

    test('function', () => {
      expectTypeOf<IsAny<() => void>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<() => 1>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<(a: 1) => void>>().toMatchTypeOf<false>()
    })

    test('symbol', () => {
      expectTypeOf<IsAny<symbol>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<symbol | 1>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<symbol | 'a'>>().toMatchTypeOf<false>()
    })

    test('nullish', () => {
      expectTypeOf<IsAny<null>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<undefined>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<null | undefined>>().toMatchTypeOf<false>()
    })

    test('unknown', () => {
      expectTypeOf<IsAny<unknown>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<never>>().toMatchTypeOf<false>()
      expectTypeOf<IsAny<unknown | never>>().toMatchTypeOf<false>()
    })
  })
})
