import { describe, test, expectTypeOf } from 'vitest'

import type { KeysToProperties } from '../../../src/utils/types/keys-to-properties'

describe('KeysToProperties', () => {
  test('returns tuple of existing values from single-layer object', () => {
    type Foo = {
      a: string
      b: number
      c: boolean
    }

    type Keys = ['a', 'b', 'c']

    type Result = KeysToProperties<Foo, Keys>

    expectTypeOf<Result>().toEqualTypeOf<[string, number, boolean]>()
  })

  test('returns never for invalid properties', () => {
    type Foo = {
      a: string
      b: number
      c: boolean
    }

    type Keys = ['d', 'e', 'f']

    type Result = KeysToProperties<Foo, Keys>

    expectTypeOf<Result>().toEqualTypeOf<[never, never, never]>()
  })
})
