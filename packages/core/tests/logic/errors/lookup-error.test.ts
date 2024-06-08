import { describe, test, expect, it } from 'vitest'

import { lookupError } from '../../../src/logic/errors/lookup-error'

describe('lookupError', () => {
  test('returns early with no error if top level property is not found', () => {
    const errors = {
      test: {
        type: 'test',
        message: 'error',
        deep: {
          type: 'deep',
          message: 'error',
        },
      },
    }

    const fields = {}

    // This is a top level property because there are no dots in the name.
    const name = 'hello'

    const result = lookupError(errors, fields, name)

    expect(result.name).toEqual(name)
    expect(result.error).toBeUndefined()
  })

  test('returns the error if a top level property is found', () => {
    const errors = {
      test: {
        type: 'test',
        message: 'error',
        deep: {
          type: 'deep',
          message: 'error',
        },
      },
    }

    const fields = {}

    const result = lookupError(errors, fields, 'test')

    expect(result.name).toEqual('test')
    expect(result.error).toEqual(errors.test)
  })

  test('returns only the name if a nested property is not found', () => {
    const errors = {
      test: {
        type: 'test',
        message: 'error',
        deep: {
          type: 'deep',
          message: 'error',
        },
      },
    }

    const fields = {}

    // This is a nested property because there are dots in the name.
    const name = 'a.b.c'

    const result = lookupError(errors, fields, name)

    expect(result.name).toEqual(name)
    expect(result.error).toBeUndefined()
  })

  test('returns only the name if a nested property is not found and no matching field array found', () => {
    const errors = {
      a: {
        type: 'test',
        message: 'error',
        b: {
          type: 'deep',
          message: 'error',
        },
      },
    }

    // 'a.b' exists, but is not an array and doesn't match with 'a.b.c'
    const fields = {
      a: {
        b: {},
      },
    }

    // 'a.b' exists, and lookupError will backtrack to find it.
    // But the field 'a.b' exists an isn't an array, so the error will be considered not found.
    const name = 'a.b.c'

    const result = lookupError(errors, fields, name)

    expect(result.name).toEqual(name)
    expect(result.error).toBeUndefined()
  })

  test('returns name and error if a nested property is found by backtracking', () => {
    const errors = {
      a: {
        type: 'test',
        message: 'error',
        b: {
          type: 'deep',
          message: 'error',
        },
      },
    }

    const fields = {}

    // 'a.b' exists, and lookupError will backtrack to find it.
    const name = 'a.b.c'

    const result = lookupError(errors, fields, name)

    expect(result.name).toEqual('a.b')
    expect(result.error).toEqual(errors.a.b)
  })
})

/**
 * React-Hook-Form refers to this function as `schemaErrorLookup`.
 */
const schemaErrorLookup = lookupError

describe('react-hook-form', () => {
  describe('errorsLookup', () => {
    it('should be able to look up the error', () => {
      expect(
        schemaErrorLookup<{
          test: {
            deep: string
          }
        }>(
          {
            test: {
              type: 'test',
              message: 'error',
              deep: {
                type: 'deep',
                message: 'error',
              },
            },
          },
          {},
          'test.deep.whatever',
        ),
      ).toEqual({
        error: {
          type: 'deep',
          message: 'error',
        },
        name: 'test.deep',
      })

      expect(
        schemaErrorLookup(
          {
            test: {
              type: 'test',
              message: 'error',
            },
          },
          {},
          'test.0.whatever',
        ),
      ).toEqual({
        error: {
          type: 'test',
          message: 'error',
        },
        name: 'test',
      })

      expect(
        schemaErrorLookup(
          {
            test: {
              type: 'test',
              message: 'error',
            },
          },
          {},
          'test',
        ),
      ).toEqual({
        error: {
          type: 'test',
          message: 'error',
        },
        name: 'test',
      })

      expect(
        schemaErrorLookup<{
          test: {
            deep: string
          }
          test1: {
            nested: {
              deepNested: string
            }
          }
        }>(
          {
            test: {
              type: 'test',
              message: 'error',
            },
            test1: {
              type: 'test',
              message: 'error',
              nested: {
                type: 'test',
                message: 'error',
                deepNested: {
                  type: 'deepNested',
                  message: 'error',
                },
              },
            },
          },
          {},
          'test1.nested.deepNested.whatever',
        ),
      ).toEqual({
        error: { message: 'error', type: 'deepNested' },
        name: 'test1.nested.deepNested',
      })
    })

    it('should return undefined when not found', () => {
      expect(
        schemaErrorLookup(
          {
            test: {
              type: 'test',
              message: 'error',
            },
          },
          {},
          'test1234',
        ),
      ).toEqual({ error: undefined, name: 'test1234' })

      expect(
        schemaErrorLookup(
          {
            test: {
              type: 'test',
              message: 'error',
            },
          },
          {},
          'testX.1.test',
        ),
      ).toEqual({
        name: 'testX.1.test',
      })

      expect(
        schemaErrorLookup<{
          test: {
            test: string
            test1: string
          }
        }>(
          {
            test: {
              test: {
                type: 'test',
                message: 'error',
              },
              test1: {
                type: 'test',
                message: 'error',
              },
            },
          },
          {},
          'test.test2',
        ),
      ).toEqual({
        name: 'test.test2',
      })
    })

    it('should prevent error from reported when field is identified', () => {
      expect(
        schemaErrorLookup<{
          test: {
            test: string
            test1: string
          }
        }>(
          {
            test: {
              test: {
                type: 'test',
                message: 'error',
              },
              test1: {
                type: 'test',
                message: 'error',
              },
            },
          },
          {
            test: {
              test1: {
                _f: {
                  ref: {},
                  name: 'test',
                },
              },
            },
          },
          'test.test1.whatever',
        ),
      ).toEqual({
        name: 'test.test1.whatever',
      })

      expect(
        schemaErrorLookup<{
          test: {
            test: string
            test1: string
          }
        }>(
          {
            test: {
              test: {
                type: 'test',
                message: 'error',
              },
              test1: {
                type: 'test',
                message: 'error',
              },
            },
          },
          {
            test: {
              test1: {
                _f: {
                  ref: {},
                  name: 'test',
                },
              },
            },
          },
          'test.testXYZ',
        ),
      ).toEqual({
        name: 'test.testXYZ',
      })
    })
  })
})
