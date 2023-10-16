import { describe, test, expect } from 'vitest'

import { deepUnset, isEmptyArray } from '../../src/utils/deep-unset'

describe('deepUnset', () => {
  test('unsets array indices', () => {
    const input = ['test', 'test1', 'test2']

    expect(deepUnset(input, '[0]')).toEqual([undefined, 'test1', 'test2'])

    expect(deepUnset(input, '[1]')).toEqual([undefined, undefined, 'test2'])

    expect(deepUnset(input, '[2]')).toEqual([undefined, undefined, undefined])
  })

  test('does not change object for invalid path', () => {
    const input = { test: 'test' }

    expect(deepUnset(input, '')).toEqual(input)

    expect(deepUnset(input, 'testDummy.test1')).toEqual(input)
  })

  test('removes nested empty object', () => {
    const input = { a: { b: {} } }

    expect(deepUnset(input, 'a.b')).toEqual({ a: undefined })
  })

  test('removes nested empty array', () => {
    const input = { a: { b: [] } }

    expect(deepUnset(input, 'a.b')).toEqual({ a: undefined })
  })

  test('does not affect null', () => {
    const input = null

    expect(deepUnset(input, 'a.b')).toEqual(null)
  })
})

describe('isEmptyArray', () => {
  test('returns true for empty array', () => {
    expect(isEmptyArray([])).toBe(true)
  })

  test('returns false for non-empty array', () => {
    expect(isEmptyArray([1])).toBe(false)
  })

  test('returns false for non-array', () => {
    expect(isEmptyArray({})).toBe(false)
  })
})
