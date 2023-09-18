import { describe, it, expect } from 'vitest'

import { objectHasFunction } from '../../src/utils/object-has-function'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/objectHasFunction.test.ts
 */
describe('objectHasFunction', () => {
  it('should detect if any object has function', () => {
    expect(objectHasFunction({})).toBeFalsy()

    expect(objectHasFunction({ test: '' })).toBeFalsy()

    expect(objectHasFunction({ test: () => {} })).toBeTruthy()
  })
})
