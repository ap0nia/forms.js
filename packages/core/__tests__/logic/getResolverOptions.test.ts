import { describe, it, expect } from 'vitest'

import getResolverOptions from '../../src/logic/fields/get-resolver-options'

describe('getFielfs', () => {
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

    expect(getResolverOptions(fieldNames, fieldsRef, undefined, true)).toMatchInlineSnapshot(`
      {
        "criteriaMode": undefined,
        "fields": {
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
        },
        "names": [
          "test.sub",
          "test1",
        ],
        "shouldUseNativeValidation": true,
      }
    `)
  })
})
