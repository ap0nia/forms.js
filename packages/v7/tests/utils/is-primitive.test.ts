import { describe, test, expect } from 'vitest'

import { isPrimitive } from '../../src/utils/is-primitive'

describe('isPrimitive', () => {
  test('true for string', () => {
    expect(isPrimitive('foobar')).toBeTruthy()
  })

  test('true for boolean', () => {
    expect(isPrimitive(false)).toBeTruthy()
  })

  test('true for number', () => {
    expect(isPrimitive(123)).toBeTruthy()
  })

  test('true for symbol', () => {
    expect(isPrimitive(Symbol())).toBeTruthy()
  })

  test('true for null', () => {
    expect(isPrimitive(null)).toBeTruthy()
  })

  test('true for undefined', () => {
    expect(isPrimitive(undefined)).toBeTruthy()
  })

  test('false for object', () => {
    expect(isPrimitive({})).toBeFalsy()
  })

  test('false for array', () => {
    expect(isPrimitive([])).toBeFalsy()
  })
})
