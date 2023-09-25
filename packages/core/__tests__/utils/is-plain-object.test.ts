import { describe, test, expect } from 'vitest'

import { isPlainObject } from '../../src/utils/is-object'

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
