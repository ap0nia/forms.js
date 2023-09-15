import { vi, describe, it, expect } from 'vitest'

import { getFieldValue, type Field } from '../../src/logic/fields'

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
})
