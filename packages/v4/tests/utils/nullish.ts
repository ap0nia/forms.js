import { describe, test, expect, expectTypeOf } from 'vitest'

import { isNullish, type Nullish } from '../../src/utils/nullish'

describe('nullish type', () => {
  test('matching type definitions', () => {
    expectTypeOf<null>().toMatchTypeOf<Nullish>()
    expectTypeOf<undefined>().toMatchTypeOf<Nullish>()
    expectTypeOf<void>().toMatchTypeOf<Nullish>()
  })

  test('mismatching type definitions', () => {
    expectTypeOf<string>().not.toMatchTypeOf<Nullish>()
    expectTypeOf<number>().not.toMatchTypeOf<Nullish>()
    expectTypeOf<boolean>().not.toMatchTypeOf<Nullish>()
  })
})

describe('is nullish type guard', () => {
  test('nullish values', () => {
    expect(isNullish(null)).toEqual(true)
    expect(isNullish(undefined)).toEqual(true)
    expect(isNullish(void 0)).toEqual(true)
  })

  test('non-nullish values', () => {
    expect(isNullish('')).toEqual(false)
    expect(isNullish(0)).toEqual(false)
    expect(isNullish(false)).toEqual(false)
  })
})
