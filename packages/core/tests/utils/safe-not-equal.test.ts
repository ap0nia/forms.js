import { describe, test, expect } from 'vitest'

import { safeNotEqual } from '../../src/utils/safe-not-equal'

describe('safeNotEqual', () => {
  describe('NaN', () => {
    test('NaN is not different from NaN', () => {
      expect(safeNotEqual(NaN, NaN)).toEqual(false)
    })

    test('NaN is different from everything else', () => {
      expect(safeNotEqual(NaN, 0)).toEqual(true)
      expect(safeNotEqual(NaN, 'hi')).toEqual(true)
      expect(safeNotEqual(NaN, false)).toEqual(true)
    })
  })

  describe('primitives', () => {
    test('same numbers are not different', () => {
      expect(safeNotEqual(0, 0)).toEqual(false)
    })

    test('same strings are not different', () => {
      expect(safeNotEqual('hi', 'hi')).toEqual(false)
    })

    test('same booleans are not different', () => {
      expect(safeNotEqual(true, true)).toEqual(false)
      expect(safeNotEqual(false, false)).toEqual(false)
    })

    test('null is not different from null', () => {
      expect(safeNotEqual(null, null)).toEqual(false)
    })

    test('undefined is not different from undefined', () => {
      expect(safeNotEqual(undefined, undefined)).toEqual(false)
    })
  })

  test('objects are always different', () => {
    expect(safeNotEqual({}, {})).toEqual(true)

    const obj = {}
    expect(safeNotEqual(obj, obj)).toEqual(true)
  })

  test('functions are always different', () => {
    expect(
      safeNotEqual(
        () => {},
        () => {},
      ),
    ).toEqual(true)

    const fn = () => {}

    expect(safeNotEqual(fn, fn)).toEqual(true)
  })
})
