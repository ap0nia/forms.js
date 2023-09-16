import { describe, test, expect } from 'vitest'

import { isObject, isPlainObject } from '../../src/utils/is-object'

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
