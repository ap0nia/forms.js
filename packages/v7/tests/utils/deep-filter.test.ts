import { describe, test, expect } from 'vitest'

import { deepFilter } from '../../src/utils/deep-filter'

describe('deepFilter', () => {
  test('returns original object if no keys to filter', () => {
    const obj = {
      a: 'foo',
      b: {
        c: 'bar',
        d: {
          e: 'baz',
        },
      },
    }

    expect(deepFilter(obj)).toEqual(obj)
  })

  test('returns original object if key array is empty', () => {
    const obj = {
      a: 'foo',
      b: {
        c: 'bar',
        d: {
          e: 'baz',
        },
      },
    }

    expect(deepFilter(obj, [])).toEqual(obj)
  })

  test('filters a single existing key', () => {
    const obj = {
      a: 'foo',
      b: {
        c: 'bar',
        d: {
          e: 'baz',
        },
      },
    }

    const expectedResult = { a: 'foo' }

    expect(deepFilter(obj, 'a')).toEqual(expectedResult)
  })

  test('filters a single non-existing key', () => {
    const obj = {
      a: 'foo',
      b: {
        c: 'bar',
        d: {
          e: 'baz',
        },
      },
    }

    const expectedResult = { z: undefined }

    expect(deepFilter(obj, 'z')).toEqual(expectedResult)
  })

  test('filters an array of existing keys', () => {
    const obj = {
      a: 'foo',
      b: {
        c: 'bar',
        d: {
          e: 'baz',
        },
      },
    }

    const expectedResult = {
      a: 'foo',
      b: {
        c: 'bar',
      },
    }

    expect(deepFilter(obj, ['a', 'b.c'])).toEqual(expectedResult)
  })

  test('filters an array of existing and non-existing keys', () => {
    const obj = {
      a: 'foo',
      b: {
        c: 'bar',
        d: {
          e: 'baz',
        },
      },
    }

    const expectedResult = {
      a: 'foo',
      b: {
        d: {
          e: 'baz',
        },
      },
      z: undefined,
      x: {
        y: {
          z: undefined,
        },
      },
    }

    expect(deepFilter(obj, ['a', 'z', 'b.d.e', 'x.y.z'])).toEqual(expectedResult)
  })
})
