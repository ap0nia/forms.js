/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getRadioValue.test.ts
 */

import { describe, it, test, expect } from 'vitest'

import { isRadioInput, getRadioValue, type RadioFieldResult } from '../../../src/logic/html/radio'

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

describe('react-hook-form', () => {
  describe('isRadioInput', () => {
    it('should return true when type is radio', () => {
      expect(isRadioInput({ name: 'test', type: 'radio' })).toBeTruthy()
    })
  })

  describe('getRadioValue', () => {
    it('should return default value if not valid or empty options', () => {
      expect(getRadioValue(undefined)).toEqual({
        isValid: false,
        value: null,
      })
    })

    it('should return valid to true when value found', () => {
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

    it('should return disabled input correctly', () => {
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
})
