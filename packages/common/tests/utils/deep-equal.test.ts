import { describe, test, expect } from 'vitest'

import { deepEqual, bothDates, bothArrays, bothObjects } from '../../src/utils/deep-equal'

describe('deepEqual', () => {
  test('true for matching primitive values', () => {
    expect(deepEqual(1, 1)).toBeTruthy()
    expect(deepEqual('1', '1')).toBeTruthy()
    expect(deepEqual(true, true)).toBeTruthy()
    expect(deepEqual(null, null)).toBeTruthy()
    expect(deepEqual(undefined, undefined)).toBeTruthy()
  })

  test('false for different primitive values', () => {
    expect(deepEqual(1, 2)).toBeFalsy()
    expect(deepEqual('1', '2')).toBeFalsy()
    expect(deepEqual(true, false)).toBeFalsy()
    expect(deepEqual(null, undefined)).toBeFalsy()
  })

  test('true for matching top level primitive properties', () => {
    expect(deepEqual({ a: 1 }, { a: 1 })).toBeTruthy()
    expect(deepEqual({ a: '1' }, { a: '1' })).toBeTruthy()
    expect(deepEqual({ a: true }, { a: true })).toBeTruthy()
    expect(deepEqual({ a: null }, { a: null })).toBeTruthy()
    expect(deepEqual({ a: undefined }, { a: undefined })).toBeTruthy()
  })

  test('false for different top level primitive properties', () => {
    expect(deepEqual({ a: 1 }, { a: 2 })).toBeFalsy()
    expect(deepEqual({ a: '1' }, { a: '2' })).toBeFalsy()
    expect(deepEqual({ a: true }, { a: false })).toBeFalsy()
    expect(deepEqual({ a: null }, { a: undefined })).toBeFalsy()
  })

  test('dates', () => {
    expect(deepEqual(new Date(0), new Date(0))).toBeTruthy()
    expect(deepEqual(new Date(0), new Date(1))).toBeFalsy()
  })

  test('false for objects with different number of keys', () => {
    const a = { a: 1 }
    const b = { a: 1, b: 2 }

    expect(deepEqual(a, b)).toBeFalsy()
  })

  test('false for arrays with different number of items', () => {
    const a = [1]
    const b = [1, 2]

    expect(deepEqual(a, b)).toBeFalsy()
  })

  test('false for nested objects with different number of keys', () => {
    const a = [{ a: 1 }]
    const b = [{ a: 1, b: 2 }]

    expect(deepEqual(a, b)).toBeFalsy()

    const ab = { a, b }

    expect(deepEqual(a, ab)).toBeFalsy()
  })

  test('false for nested objects with same number of different keys', () => {
    const a = [{ a: 1 }]
    const b = [{ b: 1 }]

    expect(deepEqual(a, b)).toBeFalsy()

    const ab = { a, b }

    expect(deepEqual(a, ab)).toBeFalsy()
  })
})

describe('bothDates', () => {
  test('true for two dates', () => {
    expect(bothDates(new Date(0), new Date(0))).toBeTruthy()
  })

  test('false for two non-dates', () => {
    expect(bothDates(0, 0)).toBeFalsy()
  })

  test('false for one date and one non-date', () => {
    expect(bothDates(new Date(0), 0)).toBeFalsy()
  })
})

describe('bothObjects', () => {
  test('true for two objects', () => {
    expect(bothObjects({}, {})).toBeTruthy()
  })

  test('false for two non-objects', () => {
    expect(bothObjects(0, 0)).toBeFalsy()
  })

  test('false for one object and one non-object', () => {
    expect(bothObjects({}, 0)).toBeFalsy()
  })
})

describe('bothArrays', () => {
  test('true for two arrays', () => {
    expect(bothArrays([], [])).toBeTruthy()
  })

  test('false for two non-arrays', () => {
    expect(bothArrays(0, 0)).toBeFalsy()
  })

  test('false for one array and one non-array', () => {
    expect(bothArrays([], 0)).toBeFalsy()
  })
})
