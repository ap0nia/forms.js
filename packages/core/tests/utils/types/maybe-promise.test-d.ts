import { describe, test, expectTypeOf } from 'vitest'

import type { MaybePromise } from '../../../src/utils/types/maybe-promise'

describe('MaybePromise', () => {
  test('allows promise', () => {
    expectTypeOf<Promise<string>>().toMatchTypeOf<MaybePromise<string>>()
    expectTypeOf<Promise<number>>().toMatchTypeOf<MaybePromise<number>>()
    expectTypeOf<Promise<unknown>>().toMatchTypeOf<MaybePromise<unknown>>()
  })

  test('allows non-promise', () => {
    expectTypeOf<string>().toMatchTypeOf<MaybePromise<string>>()
    expectTypeOf<number>().toMatchTypeOf<MaybePromise<number>>()
    expectTypeOf<unknown>().toMatchTypeOf<MaybePromise<unknown>>()
  })
})
