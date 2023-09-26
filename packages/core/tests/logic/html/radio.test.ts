import { describe, test, expect } from 'vitest'

import { isRadioInput } from '../../../src/logic/html/radio'

describe('isRadioInput', () => {
  test('returns true for radio input', () => {
    const input = document.createElement('input')

    input.type = 'radio'

    expect(isRadioInput(input)).toBe(true)
  })

  test('returns false for non-radio input', () => {
    const input = document.createElement('input')

    input.type = 'text'

    expect(isRadioInput(input)).toBe(false)
  })
})
