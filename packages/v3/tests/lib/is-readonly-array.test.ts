import { describe, test, expect } from 'vitest'

import { isReadonlyArray } from '../../src/lib/is-readonly-array'

describe('isReadonlyArray', () => {
  test('should return true for arrays because js/ts literally cannot distinguish between regular and readonly arrays', () => {
    expect(isReadonlyArray(['a', 'b', 'c'])).toBe(true)
    expect(isReadonlyArray([])).toBe(true)
  })

  test('should return false for non-array', () => {
    expect(isReadonlyArray('')).toBe(false)
  })
})
