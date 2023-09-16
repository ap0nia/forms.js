import { describe, test, expectTypeOf } from 'vitest'

import type { JoinArray } from '../../../src/utils/types/join-array'

describe('JoinArray', () => {
  test('empty array results in empty string', () => {
    expectTypeOf<JoinArray<[]>>().toEqualTypeOf<''>()
  })

  test('single element array results in string without separator', () => {
    expectTypeOf<JoinArray<[1]>>().toEqualTypeOf<'1'>()
  })

  test('non-stringable element causes entire type to fail', () => {
    expectTypeOf<JoinArray<[1, 2, 3, { a: 1 }]>>().toEqualTypeOf<never>()
  })

  test('uniform elements', () => {
    expectTypeOf<JoinArray<[1, 2, 3]>>().toEqualTypeOf<'1.2.3'>()
    expectTypeOf<JoinArray<['1', '2', '3']>>().toEqualTypeOf<'1.2.3'>()
    expectTypeOf<JoinArray<[true, false, true]>>().toEqualTypeOf<'true.false.true'>()
  })

  test('mixed elements', () => {
    expectTypeOf<
      JoinArray<[1, '2', true, null, undefined]>
    >().toEqualTypeOf<'1.2.true.null.undefined'>()
  })

  test('custom separator', () => {
    expectTypeOf<JoinArray<[1, 2, 3], '-'>>().toEqualTypeOf<'1-2-3'>()
  })

  /**
   * This is technically not an intended feature, lol. But it's allowed by the type.
   */
  test('custom separator with initial result', () => {
    expectTypeOf<JoinArray<[1, 2, 3], '-', 'initial'>>().toEqualTypeOf<'initial-1-2-3'>()
  })
})
