import { describe, test, expect } from 'vitest'

import { objectHasFunction } from '../../src/utils/object-has-function'

describe('objectHasFunction', () => {
  test('detects if object has function', () => {
    expect(objectHasFunction({})).toBeFalsy()

    expect(objectHasFunction({ test: '' })).toBeFalsy()

    expect(objectHasFunction({ test: () => {} })).toBeTruthy()
  })
})
