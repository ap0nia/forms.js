import { describe, test, expectTypeOf } from 'vitest'

import type { IsAny } from '../../src/type-utils/is-any'

describe('isAny identifies explicit any and ignores everything else', () => {
  test('any', () => {
    expectTypeOf<IsAny<any>>().toMatchTypeOf<true>()
  })

  test('string', () => {
    expectTypeOf<IsAny<string>>().toMatchTypeOf<false>()
  })

  test('boolean', () => {
    expectTypeOf<IsAny<boolean>>().toMatchTypeOf<false>()
  })

  test('number', () => {
    expectTypeOf<IsAny<number>>().toMatchTypeOf<false>()
  })

  test('string or number or boolean', () => {
    expectTypeOf<IsAny<string | number | boolean>>().toMatchTypeOf<false>()
  })

  test('unknown', () => {
    expectTypeOf<IsAny<unknown>>().toMatchTypeOf<false>()
  })

  test('never', () => {
    expectTypeOf<IsAny<never>>().toMatchTypeOf<false>()
  })

  test('object', () => {
    expectTypeOf<IsAny<object>>().toMatchTypeOf<false>()
  })

  test('{}', () => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    expectTypeOf<IsAny<{}>>().toMatchTypeOf<false>()
  })
})
