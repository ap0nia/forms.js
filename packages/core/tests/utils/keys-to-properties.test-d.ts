import { describe, test, expectTypeOf } from 'vitest'

import type { KeysToProperties } from '../../src/utils/keys-to-properties'

describe('KeysToProperties', () => {
  describe('returns tuple of values for valid keys', () => {
    test('simple object', () => {
      type Foo = {
        a: string
        b: number
        c: boolean
      }

      type Keys = ['a', 'b', 'c']

      type Result = KeysToProperties<Foo, Keys>

      expectTypeOf<Result>().toEqualTypeOf<[string, number, boolean]>()
    })
  })

  describe('returns never for invalid keys', () => {
    test('simple object', () => {
      type Foo = {
        a: string
        b: number
        c: boolean
      }

      type Keys = ['d', 'b', 'f']

      type Result = KeysToProperties<Foo, Keys>

      expectTypeOf<Result>().toEqualTypeOf<[never, number, never]>()
    })
  })
})
