import { describe, test, expectTypeOf } from 'vitest'

import type { Stringable, SeparatorIfNotEmpty, Join } from '../../src/type-utils/join'

describe('extracting stringable allows types compatible with strings', () => {
  test('string', () => {
    expectTypeOf<Extract<'hello', Stringable>>().toMatchTypeOf<'hello'>()
    expectTypeOf<Extract<'', Stringable>>().toMatchTypeOf<''>()
  })

  test('number', () => {
    expectTypeOf<Extract<123, Stringable>>().toMatchTypeOf<123>()
    expectTypeOf<Extract<0, Stringable>>().toMatchTypeOf<0>()
  })

  test('boolean', () => {
    expectTypeOf<Extract<true, Stringable>>().toMatchTypeOf<true>()
    expectTypeOf<Extract<false, Stringable>>().toMatchTypeOf<false>()
  })

  test('bigint', () => {
    expectTypeOf<Extract<bigint, Stringable>>().toMatchTypeOf<bigint>()
    expectTypeOf<Extract<0n, Stringable>>().toMatchTypeOf<0n>()
  })

  test('null', () => {
    expectTypeOf<Extract<null, Stringable>>().toMatchTypeOf<null>()
  })

  test('undefined', () => {
    expectTypeOf<Extract<undefined, Stringable>>().toMatchTypeOf<undefined>()
  })

  test('union of stringable types', () => {
    expectTypeOf<Extract<'hello' | 123 | true | null | undefined, Stringable>>().toMatchTypeOf<
      'hello' | 123 | true | null | undefined
    >()
  })

  test('union of stringable and non-stringable types', () => {
    expectTypeOf<
      Extract<'hello' | 123 | true | null | undefined | { a: 1 }, Stringable>
    >().toMatchTypeOf<'hello' | 123 | true | null | undefined>()
  })

  test('union of non-stringable types', () => {
    expectTypeOf<Extract<{ a: 1 } | { b: 2 }, Stringable>>().toMatchTypeOf<never>()
  })
})

describe('separator is only present if the provided string is empty', () => {
  test('empty string', () => {
    expectTypeOf<SeparatorIfNotEmpty<'', '.'>>().toMatchTypeOf<''>()
  })

  test('non-empty string', () => {
    expectTypeOf<SeparatorIfNotEmpty<'hello', '.'>>().toMatchTypeOf<'.'>()
  })

  test('union with empty strings', () => {
    expectTypeOf<SeparatorIfNotEmpty<'' | '', '.'>>().toMatchTypeOf<''>()
  })

  test('union with non-empty strings', () => {
    expectTypeOf<SeparatorIfNotEmpty<'a' | 'b' | 'c', '.'>>().toMatchTypeOf<'.'>()
  })

  test('union with empty and non-empty string', () => {
    expectTypeOf<SeparatorIfNotEmpty<'' | 'a' | 'b' | 'c' | '', '.'>>().toMatchTypeOf<'' | '.'>()
  })
})

describe('join an array with a separator', () => {
  test('empty array', () => {
    expectTypeOf<Join<[], '.'>>().toMatchTypeOf<''>()
  })

  test('one string', () => {
    expectTypeOf<Join<['hello'], '.'>>().toMatchTypeOf<'hello'>()
  })

  test('one number', () => {
    expectTypeOf<Join<[123], '.'>>().toMatchTypeOf<'123'>()
  })

  test('one boolean', () => {
    expectTypeOf<Join<[true], '.'>>().toMatchTypeOf<'true'>()
  })

  test('array of string, number, boolean', () => {
    expectTypeOf<Join<['hello', 123, true], '.'>>().toMatchTypeOf<'hello.123.true'>()
  })

  test('array of string, number, boolean, null, undefined', () => {
    expectTypeOf<
      Join<['hello', 123, true, null, undefined], '.'>
    >().toMatchTypeOf<'hello.123.true.null.undefined'>()
  })

  test('one non-stringable', () => {
    expectTypeOf<Join<[NonNullable<unknown>], '.'>>().toMatchTypeOf<never>()
  })

  test('array of non-stringables', () => {
    expectTypeOf<Join<[{ a: string }, { b: string }], '.'>>().toMatchTypeOf<never>()
  })

  test('array of strings and non-stringables', () => {
    expectTypeOf<Join<['a', { a: string; b: string }, 'b'], '.'>>().toMatchTypeOf<never>()
  })
})
