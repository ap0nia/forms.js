import { describe, test, expectTypeOf } from 'vitest'

import type { IsAny } from '../../src/type-utils/is-any'

describe('isAny identifies explicit any and ignores everything else', () => {
  test('any', () => {
    expectTypeOf<IsAny<any>>().toEqualTypeOf<true>()
  })

  test('string', () => {
    expectTypeOf<IsAny<string>>().toEqualTypeOf<false>()
  })

  test('boolean', () => {
    expectTypeOf<IsAny<boolean>>().toEqualTypeOf<false>()
  })

  test('number', () => {
    expectTypeOf<IsAny<number>>().toEqualTypeOf<false>()
  })

  test('string or number or boolean', () => {
    expectTypeOf<IsAny<string | number | boolean>>().toEqualTypeOf<false>()
  })

  test('unknown', () => {
    expectTypeOf<IsAny<unknown>>().toEqualTypeOf<false>()
  })

  test('never', () => {
    expectTypeOf<IsAny<never>>().toEqualTypeOf<false>()
  })

  test('object', () => {
    expectTypeOf<IsAny<object>>().toEqualTypeOf<false>()
  })

  test('{}', () => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    expectTypeOf<IsAny<{}>>().toEqualTypeOf<false>()
  })
})
