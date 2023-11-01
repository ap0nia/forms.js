import { describe, test, expect } from 'vitest'

import {
  getFieldValue,
  getFieldValueAs,
  valueToNumber,
} from '../../../src/logic/fields/get-field-value'

describe('getFieldValue', () => {
  test('select-multiple input', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          type: 'select-multiple',
          name: 'test',
          selectedOptions: [
            {
              value: 'testValue',
            },
          ] as any,
        },
      }),
    ).toEqual(['testValue'])
  })

  test('file input', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          type: 'file',
          name: 'test',
          files: null,
        },
      }),
    ).toEqual(null)
  })

  test('boolean for single radio input', () => {
    const input = document.createElement('input')

    input.type = 'radio'
    input.name = 'test'
    input.value = 'testValue'

    input.checked = false

    expect(
      getFieldValue({
        name: 'test',
        ref: input,
        refs: [input],
      }),
    ).toBeFalsy()

    input.checked = true

    expect(
      getFieldValue({
        name: 'test',
        ref: input,
        refs: [input],
      }),
    ).toBeTruthy()
  })

  test('boolean for single checked, checkbox input', () => {
    const input = document.createElement('input')

    input.type = 'checkbox'
    input.name = 'test'
    input.value = 'testValue'

    input.checked = true

    expect(
      getFieldValue({
        name: 'test',
        ref: input,
        refs: [input],
      }),
    ).toBeTruthy()

    input.checked = false

    expect(
      getFieldValue({
        name: 'test',
        ref: input,
        refs: [input],
      }),
    ).toBeFalsy()
  })

  test('custom reference', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          name: 'test',
          value: 'testValue',
        },
      }),
    ).toEqual('testValue')
  })

  test('returns nullish value if refs are disabled', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          name: 'test',
          disabled: true,
        },
        refs: [
          {
            name: 'test',
            disabled: true,
          },
        ] as any,
      }),
    ).toEqual(undefined)
  })
})

describe('getFieldValueAs', () => {
  test('returns null if null value with no conversions', () => {
    expect(getFieldValueAs(null)).toEqual(null)
  })

  test('returns value converted to number if valueAsNumber is true', () => {
    expect(getFieldValueAs('123', { valueAsNumber: true })).toEqual(123)
  })

  test('returns value converted to date if valueAsDate is true', () => {
    expect(getFieldValueAs('2020-01-01', { valueAsDate: true })).toEqual(new Date('2020-01-01'))
  })

  test('returns value from result of setValueAs', () => {
    expect(getFieldValueAs('123', { setValueAs: () => '456' })).toEqual('456')
  })
})

describe('valueToNumber', () => {
  test('returns NaN for empty string', () => {
    expect(valueToNumber('')).toEqual(NaN)
  })

  test('returns null for null', () => {
    expect(valueToNumber(null)).toEqual(null)
  })

  test('returns string converted to number', () => {
    expect(valueToNumber('123')).toEqual(123)
  })

  test('returns the same number if already a number', () => {
    expect(valueToNumber(123)).toEqual(123)
  })
})
