import { describe, it, expect } from 'vitest'

import { isFileInput } from '../../src/utils/is-file-input'

describe('isFileInput', () => {
  it('should return true when type is file', () => {
    expect(isFileInput({ name: 'test', type: 'file' })).toBeTruthy()
  })
})
