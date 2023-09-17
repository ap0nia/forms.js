import { describe, test, expect } from 'vitest'

import { isFileInput, getFileValue } from '../../../src/logic/html/file'

describe('isFileInput', () => {
  test('returns true for file', () => {
    expect(isFileInput({ name: 'test', type: 'file' })).toBeTruthy()
  })
})

describe('getFileValue', () => {
  test('returns file value', () => {
    const fileInput = document.createElement('input')
    expect(getFileValue(fileInput)).toEqual(fileInput.files)
  })
})
