import { describe, test, expect } from 'vitest'

import { isObject, isPlainObject, isEmptyObject } from '../../src/utils/is-object'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/isObject.test.ts
 */
describe('isObject', () => {
  test('returns true when value is an object', () => {
    expect(isObject({})).toBeTruthy()
    expect(isObject({ foo: 'bar' })).toBeTruthy()
    expect(isObject(new Blob())).toBeTruthy()
  })

  test('returns false when value is not an object', () => {
    expect(isObject(null)).toBeFalsy()
    expect(isObject(undefined)).toBeFalsy()
    expect(isObject(-1)).toBeFalsy()
    expect(isObject(0)).toBeFalsy()
    expect(isObject(1)).toBeFalsy()
    expect(isObject('')).toBeFalsy()
    expect(isObject([])).toBeFalsy()
    expect(isObject(['foo', 'bar'])).toBeFalsy()
    expect(isObject(() => null)).toBeFalsy()
  })
})

describe('isPlainObject', () => {
  test('returns true when value is a plain object', () => {
    expect(isPlainObject({})).toBeTruthy()
    expect(isPlainObject({ foo: 'bar' })).toBeTruthy()
  })

  test('returns false when value is not a plain object', () => {
    expect(isPlainObject(-1)).toBeFalsy()
    expect(isPlainObject(0)).toBeFalsy()
    expect(isPlainObject(1)).toBeFalsy()
    expect(isPlainObject('')).toBeFalsy()
    expect(isPlainObject([])).toBeFalsy()
    expect(isPlainObject(['foo', 'bar'])).toBeFalsy()
    expect(isPlainObject(() => null)).toBeFalsy()
    expect(isPlainObject(new Blob())).toBeFalsy()
  })
})

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/isEmptyObject.test.ts
 */
describe('isEmptyObject', () => {
  test('should return true when value is an empty object', () => {
    expect(isEmptyObject({})).toBeTruthy()
  })

  test('should return false when value is not an empty object', () => {
    expect(isEmptyObject(null)).toBeFalsy()
    expect(isEmptyObject(undefined)).toBeFalsy()
    expect(isEmptyObject(-1)).toBeFalsy()
    expect(isEmptyObject(0)).toBeFalsy()
    expect(isEmptyObject(1)).toBeFalsy()
    expect(isEmptyObject('')).toBeFalsy()
    expect(isEmptyObject(() => null)).toBeFalsy()
    expect(isEmptyObject({ foo: 'bar' })).toBeFalsy()
    expect(isEmptyObject([])).toBeFalsy()
    expect(isEmptyObject(['foo', 'bar'])).toBeFalsy()
  })
})