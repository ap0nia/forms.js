import { describe, it, expect } from 'vitest'

import { getFieldValueAs } from '../../src/logic/fields/get-field-value'

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
})
