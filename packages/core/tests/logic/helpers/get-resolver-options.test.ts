import { describe, test, expect } from 'vitest'

import type { FieldRecord } from '../../../src/logic/fields'
import { getResolverOptions } from '../../../src/logic/helpers/get-resolver-options'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/logic/getResolverOptions.test.ts
 */
describe('getResolverOptions', () => {
  test('returns fields from `fieldsNames` and `fieldsRef`', () => {
    const fieldNames = new Set(['test.sub', 'test1'])

    const fieldsRef: FieldRecord = {
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
