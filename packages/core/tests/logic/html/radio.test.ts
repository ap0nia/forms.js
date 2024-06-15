import { describe, test, expect } from 'vitest'

import { getRadioValue, type RadioFieldResult } from '../../../src/logic/html/radio'

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
