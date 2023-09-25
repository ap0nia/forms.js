import { describe, test, expect } from 'vitest'

import { deepEqual } from '../../src/utils/deep-equal'

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
})
