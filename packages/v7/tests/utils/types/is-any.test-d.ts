import { describe, test, expectTypeOf } from 'vitest'

import type { IsAny } from '../../../src/utils/types/is-any'

describe('isAny', () => {
  test('explicit any is true', () => {
    expectTypeOf<IsAny<any>>().toMatchTypeOf<true>()
  })

  test('union with any is true', () => {
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

  test('values defined as any in objects are true', () => {
    expectTypeOf<Record<string, any>[string]>().toMatchTypeOf<true>()
  })

  test('booleans are false', () => {
    expectTypeOf<IsAny<boolean>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<true>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<false>>().toMatchTypeOf<false>()
  })

  test('numbers are false', () => {
    expectTypeOf<IsAny<number>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<0>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<1>>().toMatchTypeOf<false>()
  })

  test('strings are false', () => {
    expectTypeOf<IsAny<string>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<''>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<'a'>>().toMatchTypeOf<false>()
  })

  test('objects are false', () => {
    expectTypeOf<IsAny<object>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<{}>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<{ a: 1 }>>().toMatchTypeOf<false>()
  })

  test('any array is false', () => {
    expectTypeOf<IsAny<any[]>>().toMatchTypeOf<false>()
  })

  test('arrays are false', () => {
    expectTypeOf<IsAny<[]>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<[1]>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<[1, 2]>>().toMatchTypeOf<false>()
  })

  test('functions are false', () => {
    expectTypeOf<IsAny<() => void>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<() => 1>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<(a: 1) => void>>().toMatchTypeOf<false>()
  })

  test('symbols are false', () => {
    expectTypeOf<IsAny<symbol>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<symbol | 1>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<symbol | 'a'>>().toMatchTypeOf<false>()
  })

  test('nullish is false', () => {
    expectTypeOf<IsAny<null>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<undefined>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<null | undefined>>().toMatchTypeOf<false>()
  })

  test('unknown is false', () => {
    expectTypeOf<IsAny<unknown>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<never>>().toMatchTypeOf<false>()
    expectTypeOf<IsAny<unknown | never>>().toMatchTypeOf<false>()
  })
})
