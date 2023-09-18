import { describe, test, expect } from 'vitest'

import { isSingleSelectInput, isMultipleSelectInput } from '../../../src/logic/html/select'

describe('isSingleSelectInput', () => {
  test('returns true for single select', () => {
    const input = document.createElement('select')

    expect(isSingleSelectInput(input)).toBeTruthy()
  })

  test('returns false for non-single select', () => {
    const input = document.createElement('select')

    input.multiple = true

    expect(isSingleSelectInput(input)).toBeFalsy()
  })
})

describe('isMultipleSelectInput', () => {
  test('returns true for multiple select', () => {
    const input = document.createElement('select')

    input.multiple = true

    expect(isMultipleSelectInput(input)).toBeTruthy()
  })

  test('returns false for non-multiple select', () => {
    const input = document.createElement('select')

    expect(isMultipleSelectInput(input)).toBeFalsy()
  })
})
