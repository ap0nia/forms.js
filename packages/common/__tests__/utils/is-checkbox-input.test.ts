import { describe, it, expect } from 'vitest'

import { isCheckboxInput } from '../../src/utils/is-checkbox-input'

describe('isCheckBoxInput', () => {
  it('should return true when type is checkbox', () => {
    expect(isCheckboxInput({ name: 'test', type: 'checkbox' })).toBeTruthy()
  })
})
