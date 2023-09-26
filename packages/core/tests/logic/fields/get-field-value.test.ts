import { describe, test, expect } from 'vitest'

import { getFieldValue } from '../../../src/logic/fields/get-field-value'

describe('getFieldValue', () => {
  test('returns correct value for select-multiple input', () => {
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
