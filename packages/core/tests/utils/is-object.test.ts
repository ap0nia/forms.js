import { describe, test, expect } from 'vitest'

import { isObject } from '../../src/utils/is-object'

describe('isObject', () => {
  test('returns true when for objects', () => {
    expect(isObject({})).toBeTruthy()
    expect(isObject({ foo: 'bar' })).toBeTruthy()
    expect(isObject(new Blob())).toBeTruthy()
  })

  test('returns false for non-objects', () => {
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
