import { describe, it, expect } from 'vitest'

import { filterFields } from '../../../src/logic/fields/filter-fields'

describe('filterFields', () => {
  it('should return fields from `fieldsNames` and `fieldsRef`', () => {
    const fieldNames: Set<string> = new Set(['test.sub', 'test1'])

    const fieldsRef: any = {
      test: {
        sub: {
          _f: {
            ref: { name: 'test.sub', value: 'test' },
            name: 'test.sub',
            value: 'test',
          },
        },
      },
      test1: {
        _f: {
          ref: { name: 'test1', value: 'test1' },
          name: 'test1',
          value: 'test1',
        },
      },
    }

    expect(filterFields(fieldNames, fieldsRef)).toMatchInlineSnapshot(`
      {
        "test": {
          "sub": {
            "name": "test.sub",
            "ref": {
              "name": "test.sub",
              "value": "test",
            },
            "value": "test",
          },
        },
        "test1": {
          "name": "test1",
          "ref": {
            "name": "test1",
            "value": "test1",
          },
          "value": "test1",
        },
      }
    `)
  })
})
