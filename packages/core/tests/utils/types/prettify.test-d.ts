import { describe, test, expectTypeOf } from 'vitest'

import type { Prettify } from '../../../src/utils/types/prettify'

describe('Prettify', () => {
  test('should return the same object', () => {
    type Foo = {
      a: string
      b: number
      c: {
        d: {
          e: string
        }
      }
    }
    expectTypeOf<Prettify<Foo>>().toEqualTypeOf<Foo>()
  })

  test('should merge intersection of objects', () => {
    type Foo = {
      a: string
      b: number
      c: {
        d: {
          e: string
        }
      }
    }

    type Bar = {
      f: string
      g: number
      h: {
        i: string
      }
    }

    type Baz = {
      j: string
      k: number
      l: {
        m: string
      }
    }

    interface FooBarBaz extends Foo, Bar, Baz {}

    expectTypeOf<Prettify<Foo & Bar & Baz>>().toEqualTypeOf<FooBarBaz>()
  })

  /**
   * Arrays are valid records, lol.
   * @see https://www.typescriptlang.org/play?#code/C4TwDgpgBAMg9gGygXigVwHYGsNwO4YDaAulBAB7AQYAmAzlAEoQDGcATjQDx3DsCWGAOYAaKAEMMIAHxQA-FD5poALigAzcQjoQAUFCgB6Q1AB6coA
   */
  test('no effect on arrays', () => {
    expectTypeOf<Prettify<any[]>>().toEqualTypeOf<any[]>()
    expectTypeOf<Prettify<unknown[]>>().toEqualTypeOf<unknown[]>()
    expectTypeOf<Prettify<string[]>>().toEqualTypeOf<string[]>()
  })

  test('no effect on any', () => {
    expectTypeOf<Prettify<any>>().toEqualTypeOf<any>()
  })
})
