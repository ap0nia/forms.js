import { describe, test, expectTypeOf } from 'vitest'

import type { JoinArray } from '../../../src/utils/types/join-array'

describe('JoinArray', () => {
  test('returns empty string for empty array', () => {
    expectTypeOf<JoinArray<[]>>().toEqualTypeOf<''>()
  })

  test('returns string without separator for single-element array', () => {
    expectTypeOf<JoinArray<[1]>>().toEqualTypeOf<'1'>()
  })

  test('returns never for array with invalid types', () => {
    expectTypeOf<JoinArray<[1, 2, 3, { a: 1 }]>>().toEqualTypeOf<never>()
  })

  describe('returns joined array for valid array elements', () => {
    test('all same element types', () => {
      expectTypeOf<JoinArray<[1, 2, 3]>>().toEqualTypeOf<'1.2.3'>()
      expectTypeOf<JoinArray<['1', '2', '3']>>().toEqualTypeOf<'1.2.3'>()
      expectTypeOf<JoinArray<[true, false, true]>>().toEqualTypeOf<'true.false.true'>()
    })

    test('mixed element types', () => {
      expectTypeOf<
        JoinArray<[1, '2', true, null, undefined]>
      >().toEqualTypeOf<'1.2.true.null.undefined'>()
    })
  })

  test('uses custom separator', () => {
    expectTypeOf<JoinArray<[1, 2, 3], '-'>>().toEqualTypeOf<'1-2-3'>()
  })

  /**
   * This is technically not an intended feature, lol. But it's allowed by the type.
   */
  test('appends the joined array to the initial array', () => {
    expectTypeOf<JoinArray<[1, 2, 3], '-', 'initial'>>().toEqualTypeOf<'initial-1-2-3'>()
  })
})
