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
  test('null', () => {
    expect(getFieldValueAs(null, {})).toEqual(null)
  })

  test('value as number', () => {
    expect(getFieldValueAs('123', { valueAsNumber: true })).toEqual(123)
  })

  test('value as date', () => {
    expect(getFieldValueAs('2020-01-01', { valueAsDate: true })).toEqual(new Date('2020-01-01'))
  })

  test('set value as', () => {
    expect(getFieldValueAs('123', { setValueAs: () => '456' })).toEqual('456')
  })
})

describe('valueToNumber', () => {
  test('empty string', () => {
    expect(valueToNumber('')).toEqual(NaN)
  })

  test('null', () => {
    expect(valueToNumber(null)).toEqual(null)
  })

  test('string', () => {
    expect(valueToNumber('123')).toEqual(123)
  })

  test('number', () => {
    expect(valueToNumber(123)).toEqual(123)
  })
})
