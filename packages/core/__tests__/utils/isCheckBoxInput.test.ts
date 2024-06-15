import { describe, it, expect } from 'vitest'

import { isCheckBoxInput } from '../../src/logic/html/checkbox'

describe('isCheckBoxInput', () => {
  it('should return true when type is checkbox', () => {
    expect(isCheckBoxInput({ name: 'test', type: 'checkbox' })).toBeTruthy()
  })
})
