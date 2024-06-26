import { describe, it, expect } from 'vitest'

import { isRadioInput } from '../../src/logic/html/radio'

describe('isRadioInput', () => {
  it('should return true when type is radio', () => {
    expect(isRadioInput({ name: 'test', type: 'radio' })).toBeTruthy()
  })
})
