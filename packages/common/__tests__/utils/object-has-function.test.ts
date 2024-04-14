import { describe, it, expect } from 'vitest'

import { noop } from '../../src/utils/noop'
import { objectHasFunction } from '../../src/utils/object-has-function'

describe('objectHasFunction', () => {
  it('should detect if any object has function', () => {
    expect(objectHasFunction({})).toBeFalsy()
    expect(
      objectHasFunction({
        test: '',
      }),
    ).toBeFalsy()

    expect(
      objectHasFunction({
        test: noop,
      }),
    ).toBeTruthy()
  })
})
