import { describe, test, expect, expectTypeOf } from 'vitest'

import { isNullish, notNullish, type Nullish } from '../../src/utils/null'

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

describe('not nullish type guard', () => {
  test('nullish values', () => {
    expect(notNullish(null)).toEqual(false)
    expect(notNullish(undefined)).toEqual(false)
    expect(notNullish(void 0)).toEqual(false)
  })

  test('non-nullish values', () => {
    expect(notNullish('')).toEqual(true)
    expect(notNullish(0)).toEqual(true)
    expect(notNullish(false)).toEqual(true)
  })
})
