/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getRadioValue.test.ts
 */

import { describe, test, expect } from 'vitest'

import { isRadioInput, getRadioValue } from '../../../src/logic/html/radio'

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

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getRadioValue.test.ts
 */
describe('getRadioValue', () => {
  test('returns default value if invalid or empty options', () => {
    expect(getRadioValue(undefined)).toEqual({
      isValid: false,
      value: null,
    })
  })

  test('returns valid when value found', () => {
    expect(
      getRadioValue([
        { name: 'bill', checked: false, value: '1' } as HTMLInputElement,
        { name: 'bill', checked: true, value: '2' } as HTMLInputElement,
      ]),
    ).toEqual({
      isValid: true,
      value: '2',
    })
  })

  test('returns disabled input correctly', () => {
    expect(
      getRadioValue([
        {
          name: 'bill',
          checked: false,
          value: '1',
          disabled: true,
        } as HTMLInputElement,
        { name: 'bill', checked: true, value: '2' } as HTMLInputElement,
      ]),
    ).toEqual({
      isValid: true,
      value: '2',
    })

    expect(
      getRadioValue([
        {
          name: 'bill',
          checked: false,
          value: '1',
        } as HTMLInputElement,
        {
          name: 'bill',
          checked: true,
          disabled: true,
          value: '2',
        } as HTMLInputElement,
      ]),
    ).toEqual({
      isValid: false,
      value: null,
    })
  })
})
