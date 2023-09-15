/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getCheckboxValue.test.ts
 */

import { describe, test, expect } from 'vitest'

import { getCheckboxValue, isCheckboxInput } from '../../../src/utils/html/checkbox'

describe('getCheckboxValue', () => {
  test('should return default value if not valid or empty options', () => {
    expect(getCheckboxValue(undefined)).toEqual({
      value: false,
      isValid: false,
    })
  })

  test('should return checked value if single checkbox is checked', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: '3', isValid: true })
  })

  test('should return true if single checkbox is checked and has no value', () => {
    expect(
      // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
      getCheckboxValue([{ name: 'bill', checked: true, attributes: {} }]),
    ).toEqual({ value: true, isValid: true })
  })

  test('should return true if single checkbox is checked and has empty value', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: 'test' },
        },
      ]),
    ).toEqual({ value: true, isValid: true })
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: 'test' },
        },
      ]),
    ).toEqual({ value: true, isValid: true })
  })

  test('should return false if single checkbox is un-checked', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: {},
        },
      ]),
    ).toEqual({ value: false, isValid: false })
  })

  test('should return multiple selected values', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: ['2', '3'], isValid: true })
  })

  test('should return values for checked boxes only', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '3' },
        },
        {
          name: 'bill',
          checked: false,
          value: '4',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '4' },
        },
      ]),
    ).toEqual({ value: ['3'], isValid: true })
  })

  test('should return empty array for multi checkbox with no checked box', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: false,
          value: '3',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: [], isValid: false })
  })

  test('should not return error when check box ref is undefined', () => {
    expect(
      getCheckboxValue([
        // @ts-expect-error `undefined` isn't a valid HTMLInputElement
        undefined,
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '2' },
        },
      ]),
    ).toEqual({ value: [], isValid: false })
  })

  test('should return disabled input result', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          disabled: true,
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({
      value: ['3'],
      isValid: true,
    })

    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          disabled: true,
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          disabled: true,
          checked: true,
          value: '3',
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({
      value: [],
      isValid: false,
    })

    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          disabled: true,
          // @ts-expect-error `attributes` isn't a valid HTMLInputElement property?
          attributes: { value: '2' },
        },
      ]),
    ).toEqual({
      value: false,
      isValid: false,
    })
  })
})

describe('isCheckBoxInput', () => {
  test('should return true when type is checkbox', () => {
    expect(isCheckboxInput({ name: 'test', type: 'checkbox' })).toBeTruthy()
  })
})
