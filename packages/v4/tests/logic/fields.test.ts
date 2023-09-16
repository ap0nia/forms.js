import { vi, describe, it, expect } from 'vitest'

import { getFieldValue, getFieldValueAs, type Field } from '../../src/logic/fields'

vi.mock('../../src/utils/html/radio', async (importOriginal) => {
  const mod = (await importOriginal()) ?? {}
  return {
    ...mod,
    getRadioValue: () => ({ value: 2 }),
  }
})

vi.mock('../../src/utils/html/checkbox', async (importOriginal) => {
  const mod = (await importOriginal()) ?? {}
  return {
    ...mod,
    getCheckboxValue: () => ({ value: 'testValue' }),
  }
})

describe('getFieldValue', () => {
  it('should return correct value when type is radio', () => {
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

  it('should return the correct value when type is checkbox', () => {
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

  it('should return it value for other types', () => {
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

  it('should return empty string when radio input value is not found', () => {
    expect(getFieldValue({ ref: {} } as Field['_f'])).toEqual(undefined)
  })

  it('should return files for input type file', () => {
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

  it('should return undefined when input is not found', () => {
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

  it('should not return value when the input is disabled', () => {
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

  it('return multiple select input selected options', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          name: 'test',
          type: 'select-multiple',
          selectedOptions: [{ value: 'test' }] as any,
        },
      }),
    ).toEqual(['test'])
  })

  it('returns nullish value if refs are disabled', () => {
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
  it('should return undefined when value is undefined', () => {
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

  it('should return a date object if the value is a string and date was specified', () => {
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

  it('should use a custom set value as function', () => {
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

  it('returns nan if value as number specified but empty string', () => {
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

  it('returns the same value if value as number specified but value nullish', () => {
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

  it('returns a string converted to number if value as number specified', () => {
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
