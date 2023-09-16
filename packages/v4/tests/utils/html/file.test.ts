import { describe, it, expect } from 'vitest'

import { isFileInput, getFileValue } from '../../../src/utils/html/file'

describe('is file input', () => {
  it('should return true when type is file', () => {
    expect(isFileInput({ name: 'test', type: 'file' })).toBeTruthy()
  })
})

describe('get file value', () => {
  it('should return files', () => {
    const fileInput = document.createElement('input')

    // lol
    expect(getFileValue(fileInput)).toEqual(fileInput.files)
  })
})
