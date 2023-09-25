import { describe, test, expectTypeOf } from 'vitest'

import type { UnionToIntersection } from '../../../src/utils/types/union-to-intersection'

describe('UnionToIntersection', () => {
  test('interfaces', () => {
    type A = { a: string }
    type B = { b: string }
    type C = { c: string }

    type ABC = A | B | C

    expectTypeOf<UnionToIntersection<ABC>>().toEqualTypeOf<A & B & C>()
  })

  test('primitives', () => {
    expectTypeOf<UnionToIntersection<string | number | boolean>>().toEqualTypeOf<
      string & number & boolean
    >()
  })

  test('tuples', () => {
    expectTypeOf<UnionToIntersection<[string] | [number] | [boolean]>>().toEqualTypeOf<
      [string] & [number] & [boolean]
    >()
  })
})
