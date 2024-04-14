import { describe, it, expect } from 'vitest'

import { isMultipleSelect } from '../../src/utils/is-multiple-select'

describe('isMultipleSelect', () => {
  it('should return true when type is select-multiple', () => {
    expect(isMultipleSelect({ name: 'test', type: 'select-multiple' })).toBeTruthy()
  })
})
