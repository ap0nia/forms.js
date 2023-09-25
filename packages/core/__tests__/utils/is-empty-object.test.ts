import { describe, test, expect } from 'vitest'

import { isEmptyObject } from '../../src/utils/is-object'

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
