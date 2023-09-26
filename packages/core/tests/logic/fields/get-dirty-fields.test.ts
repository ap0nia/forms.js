import { describe, test, expect } from 'vitest'

import {
  getDirtyFields,
  getDirtyFieldsFromDefaultValues,
  markFieldsDirty,
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

  test('nested array', () => {
    const original = { a: ['1', '2', '3'] }

    const input = { a: ['1', '2', '3'] }

    const dirtyFields = getDirtyFieldsFromDefaultValues(original, input, {})

    expect(dirtyFields).toEqual({ a: [true, true, true] })
  })
})

describe('getDirtyFields', () => {
  test('returns no dirty fields if data is not an object', () => {
    const dirtyFields = getDirtyFields('test', 'test')
    expect(dirtyFields).toEqual({})
  })
})

describe('markFieldsDirty', () => {
  test('dirty indices in array causes all indices to be marked dirty', () => {
    const original = [1, 2, 3]

    const input = [3, 2, 1]

    const dirtyFields = markFieldsDirty(original, input)

    expect(dirtyFields).toEqual([true, true, true])
  })

  test('dirty indices in nested array causes all indices to be marked dirty', () => {
    const original = [
      [1, 2, 3],
      [1, 2, 3],
    ]

    const input = [
      [3, 2, 1],
      [1, 2, 3],
    ]

    const dirtyFields = markFieldsDirty(original, input)

    expect(dirtyFields).toEqual([
      [true, true, true],
      [true, true, true],
    ])
  })

  test('nested object', () => {
    const original = {
      test: {
        test1: 'bill',
        test2: 'luo',
      },
    }

    const input = {
      test: {
        test1: 'bill',
        test2: 'luo',
      },
    }

    const dirtyFields = markFieldsDirty(original, input)

    expect(dirtyFields).toEqual({ test: { test1: true, test2: true } })
  })
})
