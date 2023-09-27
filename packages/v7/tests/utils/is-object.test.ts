import { describe, test, expect } from 'vitest'

import { isObject } from '../../src/utils/is-object'

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
