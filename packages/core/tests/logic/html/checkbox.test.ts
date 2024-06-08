import { describe, test, expect } from 'vitest'

import {
  isCheckBoxInput,
  getCheckBoxValue,
  type CheckboxFieldResult,
} from '../../../src/logic/html/checkbox'

describe('isCheckBoxInput', () => {
  test('returns true for checkbox input', () => {
    const input = document.createElement('input')
    input.type = 'checkbox'

    expect(isCheckBoxInput(input)).toBeTruthy()
  })

  test('returns false for non checkbox input', () => {
    const input = document.createElement('input')
    input.type = 'text'

    expect(isCheckBoxInput(input)).toBeFalsy()
  })
})

describe('getCheckboxValue', () => {
  test('returns correct values for invalid or empty options', () => {
    expect(getCheckBoxValue(undefined)).toEqual({ value: false, isValid: false })
  })

  test('returns checked value for checked single checkbox', () => {
    const option = document.createElement('input')

    option.type = 'checkbox'
    option.checked = true
    option.value = '3'

    const expectedResult: CheckboxFieldResult = { value: option.value, isValid: true }

    expect(getCheckBoxValue([option])).toEqual(expectedResult)
  })

  test('returns true for checked single checkbox with no value defined', () => {
    const option = document.createElement('input')

    option.type = 'checkbox'
    option.checked = true

    const expectedResult: CheckboxFieldResult = { value: true, isValid: true }

    expect(getCheckBoxValue([option])).toEqual(expectedResult)
  })

  test('returns true for checked single checkbox with empty string value', () => {
    const option = document.createElement('input')

    option.type = 'checkbox'
    option.checked = true
    option.value = ''

    const expectedResult: CheckboxFieldResult = { value: true, isValid: true }

    expect(getCheckBoxValue([option])).toEqual(expectedResult)
  })

  test('returns false for unchecked single checkbox', () => {
    const option = document.createElement('input')

    option.type = 'checkbox'
    option.checked = false

    const expectedResult: CheckboxFieldResult = { value: false, isValid: false }

    expect(getCheckBoxValue([option])).toEqual(expectedResult)
  })

  test('returns multiple selected values', () => {
    const options: HTMLInputElement[] = []

    options[0] = document.createElement('input')
    options[0].type = 'checkbox'
    options[0].checked = true
    options[0].value = '2'

    options[1] = document.createElement('input')
    options[1].type = 'checkbox'
    options[1].checked = true
    options[1].value = '3'

    const expectedResult: CheckboxFieldResult = {
      value: options.map((option) => option.value),
      isValid: true,
    }

    expect(getCheckBoxValue(options)).toEqual(expectedResult)
  })

  test('returns values for checked boxes only', () => {
    const options: HTMLInputElement[] = []

    options[0] = document.createElement('input')
    options[0].type = 'checkbox'
    options[0].checked = false
    options[0].value = '2'

    options[1] = document.createElement('input')
    options[1].type = 'checkbox'
    options[1].checked = true
    options[1].value = '3'

    options[2] = document.createElement('input')
    options[2].type = 'checkbox'
    options[2].checked = false
    options[2].value = '4'

    const expectedResult: CheckboxFieldResult = {
      value: options.filter((option) => option.checked).map((option) => option.value),
      isValid: true,
    }

    expect(getCheckBoxValue(options)).toEqual(expectedResult)
  })

  test('returns empty array for multi-checkbox with no checked boxes', () => {
    const options: HTMLInputElement[] = []

    options[0] = document.createElement('input')
    options[0].type = 'checkbox'
    options[0].checked = false
    options[0].value = '2'

    options[1] = document.createElement('input')
    options[1].type = 'checkbox'
    options[1].checked = false
    options[1].value = '3'

    const expectedResult: CheckboxFieldResult = {
      value: options.filter((option) => option.checked).map((option) => option.value),
      isValid: false,
    }

    expect(getCheckBoxValue(options)).toEqual(expectedResult)
  })

  test('no errors for undefined checkbox ref', () => {
    const options: HTMLInputElement[] = []

    options[0] = undefined as any

    options[1] = document.createElement('input')
    options[1].type = 'checkbox'
    options[1].checked = false
    options[1].value = '2'

    const expectedResult: CheckboxFieldResult = {
      value: options.filter((option) => option && option.checked).map((option) => option.value),
      isValid: false,
    }

    expect(getCheckBoxValue(options)).toEqual(expectedResult)
  })

  test('returns disabled input result', () => {
    const options: HTMLInputElement[] = []

    options[0] = document.createElement('input')
    options[0].type = 'checkbox'
    options[0].checked = false
    options[0].value = '2'
    options[0].disabled = true

    options[1] = document.createElement('input')
    options[1].type = 'checkbox'
    options[1].checked = false
    options[1].value = '3'

    const expectedResult: CheckboxFieldResult = {
      value: options.filter((option) => option.checked).map((option) => option.value),
      isValid: false,
    }

    expect(getCheckBoxValue(options)).toEqual(expectedResult)
  })
})
