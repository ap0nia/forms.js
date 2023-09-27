import { describe, test, expectTypeOf } from 'vitest'

import type { LiteralUnion } from '../../../src/utils/types/literal-union'

describe('LiteralUnion', () => {
  test('allows the original string union', () => {
    type Animal = LiteralUnion<'dog' | 'cat' | 'bird', string>

    expectTypeOf<'dog'>().toMatchTypeOf<Animal>()
    expectTypeOf<'cat'>().toMatchTypeOf<Animal>()
    expectTypeOf<'bird'>().toMatchTypeOf<Animal>()
  })

  test('allows any string', () => {
    type Animal = LiteralUnion<'dog' | 'cat' | 'bird', string>

    expectTypeOf<string>().toMatchTypeOf<Animal>()
  })

  test('allows original number union', () => {
    type NumberOrString = LiteralUnion<1 | 2 | 3, number>

    expectTypeOf<1>().toMatchTypeOf<NumberOrString>()
    expectTypeOf<2>().toMatchTypeOf<NumberOrString>()
    expectTypeOf<3>().toMatchTypeOf<NumberOrString>()
  })

  test('allows any number', () => {
    type NumberOrString = LiteralUnion<1 | 2 | 3, number>

    expectTypeOf<number>().toMatchTypeOf<NumberOrString>()
  })

  test('allows original sring and number union', () => {
    type NumberOrString = LiteralUnion<'a' | 'b' | 1 | 2, number | string>

    expectTypeOf<'a'>().toMatchTypeOf<NumberOrString>()
    expectTypeOf<'b'>().toMatchTypeOf<NumberOrString>()
    expectTypeOf<1>().toMatchTypeOf<NumberOrString>()
    expectTypeOf<2>().toMatchTypeOf<NumberOrString>()
  })

  test('allows any string or number', () => {
    type NumberOrString = LiteralUnion<'a' | 'b' | 1 | 2, number | string>

    expectTypeOf<number>().toMatchTypeOf<NumberOrString>()
    expectTypeOf<string>().toMatchTypeOf<NumberOrString>()
  })
})
