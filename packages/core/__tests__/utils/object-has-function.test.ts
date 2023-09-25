import { describe, it, expect } from 'vitest'

import { objectHasFunction } from '../../src/utils/object-has-function'

describe('objectHasFunction', () => {
  it('should detect if any object has function', () => {
    expect(objectHasFunction({})).toBeFalsy()

    expect(objectHasFunction({ test: '' })).toBeFalsy()

    expect(objectHasFunction({ test: () => {} })).toBeTruthy()
  })
})