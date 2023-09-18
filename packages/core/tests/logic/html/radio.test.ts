/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getRadioValue.test.ts
 */

import { describe, test, expect } from 'vitest'

import { isRadioInput, getRadioValue, type RadioFieldResult } from '../../../src/logic/html/radio'

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
    expect(getRadioValue(undefined)).toEqual({ isValid: false, value: null })
  })

  test('returns valid when value found', () => {
    const options: HTMLInputElement[] = []

    options[0] = document.createElement('input')
    options[0].type = 'radio'
    options[0].name = 'bill'
    options[0].checked = false
    options[0].value = '1'

    options[1] = document.createElement('input')
    options[1].type = 'radio'
    options[1].name = 'bill'
    options[1].checked = true
    options[1].value = '2'

    const expectedResult: RadioFieldResult = {
      isValid: true,
      value: options.find((option) => option.checked)?.value ?? '',
    }

    expect(getRadioValue(options)).toEqual(expectedResult)
  })

  test('returns disabled input correctly', () => {
    const options: HTMLInputElement[] = []

    options[0] = document.createElement('input')
    options[0].type = 'radio'
    options[0].name = 'bill'
    options[0].checked = false
    options[0].value = '1'
    options[0].disabled = true

    options[1] = document.createElement('input')
    options[1].type = 'radio'
    options[1].name = 'bill'
    options[1].checked = true
    options[1].value = '2'

    const expectedResult: RadioFieldResult = {
      isValid: true,
      value: options.find((option) => option.checked)?.value ?? '',
    }

    expect(getRadioValue(options)).toEqual(expectedResult)
  })
})
