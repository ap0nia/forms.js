import { describe, test, expect, vi } from 'vitest'

import { getFieldValue, getFieldValueAs } from '../../../src/logic/fields/get-field-value'
import type { FieldReference } from '../../../src/types/fields'

vi.mock('../../../src/logic/html/radio', async (importOriginal) => {
  const mod = (await importOriginal()) ?? undefined
  return {
    ...mod,
    getRadioValue: () => ({ value: 2 }),
  }
})

vi.mock('../../../src/logic/html/checkbox', async (importOriginal) => {
  const mod = (await importOriginal()) ?? undefined
  return {
    ...mod,
    getCheckBoxValue: () => ({ value: 'testValue' }),
  }
})

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getFieldValue.test.ts
 */
describe('getFieldValue', () => {
  test('returns correct value for radio input', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          type: 'radio',
          name: 'test',
        },
      }),
    ).toBe(2)
  })

  test('returns correct value for checkbox input', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          name: 'test',
          type: 'checkbox',
        },
      }),
    ).toBe('testValue')
  })

  test('returns its value for other input types', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          type: 'text',
          name: 'bill',
          value: 'value',
        },
      }),
    ).toBe('value')
  })

  test('returns empty string when radio input value is not found', () => {
    expect(getFieldValue({ ref: {} } as FieldReference)).toEqual(undefined)
  })

  test('returns files for file input', () => {
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

  test('returns undefined when input not found', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          name: 'file',
          files: null,
        },
      }),
    ).toEqual(undefined)
  })

  test('should not return value when the input is disabled', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          name: 'radio',
          disabled: true,
          type: 'radio',
        },
      }),
    ).toEqual(undefined)
  })
})

describe('getFieldValueAs', () => {
  test('returns undefined when value is undefined', () => {
    expect(
      getFieldValueAs(undefined, {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: true,
        valueAsDate: false,
      }),
    ).toBeUndefined()
  })

  test('returns a date object if the value is a string and date was specified', () => {
    expect(
      getFieldValueAs('2020-01-01', {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsDate: true,
      }),
    ).toEqual(new Date('2020-01-01'))
  })

  test('should use a custom set value as function', () => {
    const value = '2020-01-01'

    const setValueAs = (value: string) => value + 'aponia'

    expect(
      getFieldValueAs(value, {
        ref: {
          name: 'test',
        },
        name: 'test',
        setValueAs,
      }),
    ).toEqual(setValueAs(value))
  })

  test('returns nan if value as number specified but empty string', () => {
    expect(
      getFieldValueAs('', {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: true,
      }),
    ).toEqual(NaN)
  })

  test('returns the same value if value as number specified but value nullish', () => {
    expect(
      getFieldValueAs(0, {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: true,
      }),
    ).toEqual(0)
  })

  test('returns a string converted to number if value as number specified', () => {
    expect(
      getFieldValueAs('1', {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: true,
      }),
    ).toEqual(1)
  })
})
