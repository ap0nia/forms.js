import { describe, test, expect } from 'vitest'

import { isFileInput, getFileValue } from '../../../src/logic/html/file'

describe('isFileInput', () => {
  test('returns true for file input', () => {
    const input = document.createElement('input')
    input.type = 'file'

    expect(isFileInput(input)).toBeTruthy()
  })

  test('returns false for non file input', () => {
    const input = document.createElement('input')
    input.type = 'text'

    expect(isFileInput(input)).toBeFalsy()
  })
})

describe('getFileValue', () => {
  test('returns file value', () => {
    const fileInput = document.createElement('input')

    expect(getFileValue(fileInput)).toEqual(fileInput.files)
  })
})
