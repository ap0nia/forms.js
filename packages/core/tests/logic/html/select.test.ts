import { describe, test, expect } from 'vitest'

import { isSingleSelectInput, isMultipleSelectInput } from '../../../src/logic/html/select'

describe('isSingleSelectInput', () => {
  test('returns true for single select', () => {
    expect(isSingleSelectInput({ name: 'test', type: 'select-one' })).toBeTruthy()
  })

  test('returns false for non-single select', () => {
    expect(isSingleSelectInput({ name: 'test', type: 'select-multiple' })).toBeFalsy()
  })
})

describe('isMultipleSelectInput', () => {
  test('returns true for multiple select', () => {
    expect(isMultipleSelectInput({ name: 'test', type: 'select-multiple' })).toBeTruthy()
  })

  test('returns false for non-multiple select', () => {
    expect(isMultipleSelectInput({ name: 'test', type: 'select-one' })).toBeFalsy()
  })
})
