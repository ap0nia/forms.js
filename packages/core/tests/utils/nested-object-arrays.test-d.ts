import { describe, test, expectTypeOf } from 'vitest'

import type { NestedObjectArrays } from '../../src/utils/nested-object-arrays'

describe('NestedObjectArrays', () => {
  test('it works', () => {
    type MyType = {
      a: { b: string; c: { d: number[] } }[]
      e: { f: boolean }[]
      g: any[]
      h: string[]
    }

    type Expected = {
      a: { b: string; c: { d: number[] } }[]
      e: { f: boolean }[]
      g: any[]
    }

    expectTypeOf<NestedObjectArrays<MyType>>().toEqualTypeOf<Expected>
  })
})
