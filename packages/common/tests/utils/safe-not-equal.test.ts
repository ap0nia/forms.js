import { describe, test, expect } from 'vitest'

import { safeNotEqual } from '../../src/utils/safe-not-equal'

describe('safeNotEqual', () => {
  describe('NaN', () => {
    test('returns false for NaN and NaN', () => {
      expect(safeNotEqual(NaN, NaN)).toBeFalsy()
    })

    test('returns false for NaN and everything else', () => {
      expect(safeNotEqual(NaN, 0)).toBeTruthy()
      expect(safeNotEqual(NaN, 'hi')).toBeTruthy()
      expect(safeNotEqual(NaN, false)).toBeTruthy()
    })
  })

  describe('primitives', () => {
    test('returns false for same numbers', () => {
      expect(safeNotEqual(0, 0)).toBeFalsy()
    })

    test('returns false for same strings', () => {
      expect(safeNotEqual('hi', 'hi')).toBeFalsy()
    })

    test('returns false for same booleans', () => {
      expect(safeNotEqual(true, true)).toBeFalsy()
      expect(safeNotEqual(false, false)).toBeFalsy()
    })

    test('returns false for null and null', () => {
      expect(safeNotEqual(null, null)).toBeFalsy()
    })

    test('returns false for undefined and undefined', () => {
      expect(safeNotEqual(undefined, undefined)).toBeFalsy()
    })
  })

  test('always returns false for two objects', () => {
    const obj = {}
    expect(safeNotEqual(obj, obj)).toBeTruthy()
  })

  test('always returns false for two functions', () => {
    const fn = () => {}
    expect(safeNotEqual(fn, fn)).toBeTruthy()
  })
})
