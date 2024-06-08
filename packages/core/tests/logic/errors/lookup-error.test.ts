import { describe, test, expect } from 'vitest'

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
