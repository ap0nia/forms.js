import { describe, test, expect } from 'vitest'

import { isCheckBoxInput, getCheckboxValue } from '../../../src/logic/html/checkbox'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/isCheckBoxInput.test.ts
 */
describe('isCheckBoxInput', () => {
  test('returns true for checkbox', () => {
    expect(isCheckBoxInput({ name: 'test', type: 'checkbox' })).toBeTruthy()
  })
})

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getCheckboxValue.test.ts
 */
describe('getCheckboxValue', () => {
  test('returns default value for invalid or empty options', () => {
    expect(getCheckboxValue(undefined)).toEqual({
      value: false,
      isValid: false,
    })
  })

  test('returns checked value for checked single checkbox', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: '3', isValid: true })
  })

  test('returns true for checked single checkbox with no value', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: {},
        },
      ]),
    ).toEqual({ value: true, isValid: true })
  })

  test('returns true for checked single checkbox with empty value', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: 'test' },
        },
      ]),
    ).toEqual({ value: true, isValid: true })
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: 'test' },
        },
      ]),
    ).toEqual({ value: true, isValid: true })
  })

  test('returns false for un-checked single checkbox', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: {},
        },
      ]),
    ).toEqual({ value: false, isValid: false })
  })

  test('returns multiple selected values', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: ['2', '3'], isValid: true })
  })

  test('returns values for checked boxes only', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '3' },
        },
        {
          name: 'bill',
          checked: false,
          value: '4',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '4' },
        },
      ]),
    ).toEqual({ value: ['3'], isValid: true })
  })

  test('returns empty array for multi-checkbox with no checked boxes', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: false,
          value: '3',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '3' },
        },
      ]),
    ).toEqual({ value: [], isValid: false })
  })

  test('does not return error for undefined checkbox ref', () => {
    expect(
      getCheckboxValue([
        // @ts-expect-error Not a valid HTML element.
        undefined,
        {
          name: 'bill',
          checked: false,
          value: '2',
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '2' },
        },
      ]),
    ).toEqual({ value: [], isValid: false })
  })

  test('returns disabled input result', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          disabled: true,
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          checked: true,
          value: '3',
          // @ts-expect-error Not a universal property for HTML elements.
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
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '2' },
        },
        {
          name: 'bill',
          disabled: true,
          checked: true,
          value: '3',
          // @ts-expect-error Not a universal property for HTML elements.
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
          // @ts-expect-error Not a universal property for HTML elements.
          attributes: { value: '2' },
        },
      ]),
    ).toEqual({
      value: false,
      isValid: false,
    })
  })
})
