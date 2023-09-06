import { describe, test, expectTypeOf } from 'vitest'

import type { Stringable, SeparatorIfNotEmpty, Join } from '../../src/type-utils/join'

describe('extracting stringable allows types compatible with strings', () => {
  test('string', () => {
    expectTypeOf<Extract<'hello', Stringable>>().toEqualTypeOf<'hello'>()
    expectTypeOf<Extract<'', Stringable>>().toEqualTypeOf<''>()
  })

  test('number', () => {
    expectTypeOf<Extract<123, Stringable>>().toEqualTypeOf<123>()
    expectTypeOf<Extract<0, Stringable>>().toEqualTypeOf<0>()
  })

  test('boolean', () => {
    expectTypeOf<Extract<true, Stringable>>().toEqualTypeOf<true>()
    expectTypeOf<Extract<false, Stringable>>().toEqualTypeOf<false>()
  })

  test('bigint', () => {
    expectTypeOf<Extract<bigint, Stringable>>().toEqualTypeOf<bigint>()
    expectTypeOf<Extract<0n, Stringable>>().toEqualTypeOf<0n>()
  })

  test('null', () => {
    expectTypeOf<Extract<null, Stringable>>().toEqualTypeOf<null>()
  })

  test('undefined', () => {
    expectTypeOf<Extract<undefined, Stringable>>().toEqualTypeOf<undefined>()
  })

  test('union of stringable types', () => {
    expectTypeOf<Extract<'hello' | 123 | true | null | undefined, Stringable>>().toEqualTypeOf<
      'hello' | 123 | true | null | undefined
    >()
  })

  test('union of stringable and non-stringable types', () => {
    expectTypeOf<
      Extract<'hello' | 123 | true | null | undefined | { a: 1 }, Stringable>
    >().toEqualTypeOf<'hello' | 123 | true | null | undefined>()
  })

  test('union of non-stringable types', () => {
    expectTypeOf<Extract<{ a: 1 } | { b: 2 }, Stringable>>().toEqualTypeOf<never>()
  })
})

describe('separator is only present if the provided string is empty', () => {
  test('empty string', () => {
    expectTypeOf<SeparatorIfNotEmpty<'', '.'>>().toEqualTypeOf<''>()
  })

  test('non-empty string', () => {
    expectTypeOf<SeparatorIfNotEmpty<'hello', '.'>>().toEqualTypeOf<'.'>()
  })

  test('union with empty strings', () => {
    expectTypeOf<SeparatorIfNotEmpty<'' | '', '.'>>().toEqualTypeOf<''>()
  })

  test('union with non-empty strings', () => {
    expectTypeOf<SeparatorIfNotEmpty<'a' | 'b' | 'c', '.'>>().toEqualTypeOf<'.'>()
  })

  test('union with empty and non-empty string', () => {
    expectTypeOf<SeparatorIfNotEmpty<'' | 'a' | 'b' | 'c' | '', '.'>>().toEqualTypeOf<'' | '.'>()
  })
})

describe('join an array with a separator', () => {
  test('empty array', () => {
    expectTypeOf<Join<[], '.'>>().toEqualTypeOf<''>()
  })

  test('one string', () => {
    expectTypeOf<Join<['hello'], '.'>>().toEqualTypeOf<'hello'>()
  })

  test('one number', () => {
    expectTypeOf<Join<[123], '.'>>().toEqualTypeOf<'123'>()
  })

  test('one boolean', () => {
    expectTypeOf<Join<[true], '.'>>().toEqualTypeOf<'true'>()
  })

  test('array of string, number, boolean', () => {
    expectTypeOf<Join<['hello', 123, true], '.'>>().toEqualTypeOf<'hello.123.true'>()
  })

  test('array of string, number, boolean, null, undefined', () => {
    expectTypeOf<
      Join<['hello', 123, true, null, undefined], '.'>
    >().toEqualTypeOf<'hello.123.true.null.undefined'>()
  })

  test('one non-stringable', () => {
    expectTypeOf<Join<[NonNullable<unknown>], '.'>>().toEqualTypeOf<never>()
  })

  test('array of non-stringables', () => {
    expectTypeOf<Join<[{ a: string }, { b: string }], '.'>>().toEqualTypeOf<never>()
  })

  test('array of strings and non-stringables', () => {
    expectTypeOf<Join<['a', { a: string; b: string }, 'b'], '.'>>().toEqualTypeOf<never>()
  })
})
