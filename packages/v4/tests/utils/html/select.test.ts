import { describe, it, expect } from 'vitest'

import { isMultipleSelectInput, isSingleSelectInput } from '../../../src/utils/html/select'

describe('isSelectInput', () => {
  it('should return true when type is select-one', () => {
    expect(isSingleSelectInput({ name: 'test', type: 'select-one' })).toBeTruthy()
  })

  it('should return true when type is select-multiple', () => {
    expect(isMultipleSelectInput({ name: 'test', type: 'select-multiple' })).toBeTruthy()
  })
})
