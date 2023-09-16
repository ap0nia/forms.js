/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getRadioValue.test.ts
 */

import { describe, it, expect } from 'vitest'

import { getRadioValue } from '../../../src/utils/html/radio'

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