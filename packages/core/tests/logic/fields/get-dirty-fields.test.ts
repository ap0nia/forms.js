import { describe, test, expect } from 'vitest'

import {
  getDirtyFields,
  markFieldsDirty,
  getDirtyFieldsFromDefaultValues,
} from '../../../src/logic/fields/get-dirty-fields'

describe('getDirtyFields', () => {
  test('marks any mismatching properties (i.e. missing or additional) as dirty', () => {
    const dirtyFields = getDirtyFields(
      {
        test: {
          test1: 'a',
          test2: 'b',
        },
      },
      {},
    )

    expect(dirtyFields).toEqual({ test: { test1: true, test2: true } })
  })
})

describe('markFieldsDirty', () => {
  describe('does not modify fields if data is not an object or array', () => {
    test('null', () => {
      const data = null

      const fields = {}

      markFieldsDirty(data, fields)

      expect(fields).toEqual({})
    })

    test('boolean', () => {
      const data = true

      const fields = {}

      markFieldsDirty(data, fields)

      expect(fields).toEqual({})
    })
  })

  describe('creates arrays in fields for all array properties in data', () => {
    test('creates empty array in fields if array is empty in data', () => {
      const data = {
        test: [],
      }

      const fields = {}

      markFieldsDirty(data, fields)

      expect(fields).toEqual({
        test: [],
      })
    })

    test('creates array with true if array in data has values', () => {
      const data = {
        test: ['a', 'b', 'c'],
      }

      const fields = {}

      markFieldsDirty(data, fields)

      expect(fields).toEqual({
        test: data.test.map(() => true),
      })
    })
  })

  test('creates nested objects in fields for nested objects with no functions in data', () => {
    const data = {
      a: {
        b: 'hello',
      },
    }

    const fields = {}

    markFieldsDirty(data, fields)

    expect(fields).toEqual({
      a: {
        b: true,
      },
    })
  })

  test('does not recur into objects with functions', () => {
    const data = {
      a: {
        b: 'hello',
        c: () => {},
      },
    }

    const fields = {}

    markFieldsDirty(data, fields)

    expect(fields).toEqual({ a: true })
  })
})

describe('getDirtyFieldsFromDefaultValues', () => {
  describe('does not dirtyFields if data is not an object or array', () => {
    test('null', () => {
      const data = null

      const values = {}

      const dirtyFields = {}

      getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

      expect(dirtyFields).toEqual({})
    })

    test('boolean', () => {
      const data = true

      const values = {}

      const dirtyFields = {}

      getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

      expect(dirtyFields).toEqual({})
    })
  })

  describe('eagerly evaluates dirty state of non-array objects with functions', () => {
    test('returns not dirty if not deeply equal starting from object with function', () => {
      const d = () => {}

      const data = {
        a: {
          b: {
            c: 'hello',
          },
          d,
        },
      }

      const values = {
        a: {
          b: {
            c: 'goodbye',
          },
          d,
        },
      }

      const dirtyFields = {}

      getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

      expect(dirtyFields).toEqual({ a: true })
    })

    test('returns not dirty if deeply equal starting from object with function', () => {
      const d = () => {}

      const data = {
        a: {
          b: {
            c: 'hello',
          },
          d,
        },
      }

      const values = {
        a: {
          b: {
            c: 'hello',
          },
          d,
        },
      }

      const dirtyFields = {}

      getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

      expect(dirtyFields).toEqual({ a: false })
    })
  })

  describe('nested arrays all get mapped to booleans', () => {
    test('creates empty array for empty array in the data', () => {
      const data = {
        test: [],
      }

      const values = {
        test: [],
      }

      const dirtyFields = {}

      getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

      expect(dirtyFields).toEqual({
        test: [],
      })
    })

    test('marks all elements in array with values as dirty', () => {
      const data = {
        test: ['a', 'b', 'c'],
      }

      const values = {
        test: ['a', 'b', 'c'],
      }

      const dirtyFields = {}

      getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

      expect(dirtyFields).toEqual({
        test: data.test.map(() => true),
      })
    })

    test('marks all elements in array as false if provided default values are same', () => {
      const data = {
        test: ['a', 'b', 'c'],
      }

      const values = {
        test: ['a', 'b', 'c'],
      }

      const dirtyFields = {
        test: ['a', 'b', 'c'],
      }

      const result = getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

      expect(result).toEqual({
        test: data.test.map(() => false),
      })
    })

    test('marks all elements in array as true if no values to compare with default values', () => {
      const data = {
        test: ['a', 'b', 'c'],
      }

      const values = {}

      const dirtyFields = {
        test: ['a', 'b', 'c'],
      }

      const result = getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

      expect(result).toEqual({
        test: data.test.map(() => true),
      })
    })
  })

  test('marks nested property as dirty if values is null', () => {
    const data = {
      a: {
        b: {
          c: 'hi',
        },
      },
    }

    const values = null

    const dirtyFields = {}

    getDirtyFieldsFromDefaultValues(data, values, dirtyFields)

    expect(dirtyFields).toEqual({ a: { b: { c: true } } })
  })
})
