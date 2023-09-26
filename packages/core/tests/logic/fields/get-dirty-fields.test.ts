import { describe, test, expect } from 'vitest'

import {
  getDirtyFields,
  getDirtyFieldsFromDefaultValues,
} from '../../../src/logic/fields/get-dirty-fields'

describe('getDirtyFieldsFromDefaultValues', () => {
  test('null form values', () => {
    const dirtyFields = getDirtyFieldsFromDefaultValues(
      {
        test: {
          test1: 'bill',
          test2: 'luo',
        },
      },
      null,
      {},
    )

    expect(dirtyFields).toEqual({ test: { test1: true, test2: true } })
  })

  test('existing dirty fields', () => {
    const dirtyFields = getDirtyFieldsFromDefaultValues(
      {
        test: {
          test1: 'bill',
          test2: 'luo',
        },
      },
      {},
      {
        test: {
          test1: true,
        },
      },
    )

    expect(dirtyFields).toEqual({ test: { test1: true, test2: true } })
  })
})

describe('getDirtyFields', () => {
  test('returns no dirty fields if data is not an object', () => {
    const dirtyFields = getDirtyFields('test', 'test')
    expect(dirtyFields).toEqual({})
  })
})
