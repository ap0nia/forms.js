import { describe, test, expect } from 'vitest'

import { lookupError } from '../../../src/logic/errors/lookup-error'

describe('lookupError', () => {
  test('should be able to look up the error', () => {
    expect(
      lookupError<{
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
      lookupError(
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
      lookupError(
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
      lookupError<{
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

  test('should return undefined when not found', () => {
    expect(
      lookupError(
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
      lookupError(
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
      lookupError<{
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

  test('should prevent error from reported when field is identified', () => {
    expect(
      lookupError<{
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
                ref: { name: 'test' },
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
      lookupError<{
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
                ref: { name: 'test' },
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
