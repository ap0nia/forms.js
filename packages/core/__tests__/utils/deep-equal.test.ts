import { describe, test, expect } from 'vitest'

import { deepEqual } from '../../src/utils/deep-equal'

describe('deepEqual', () => {
  test('false for different sets', () => {
    expect(deepEqual([{ test: '123' }, { test: '455' }, { test: '455' }], [])).toBeFalsy()

    expect(
      deepEqual(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }, { test: '455', test1: 'what' }],
      ),
    ).toBeFalsy()

    expect(deepEqual([{}], [])).toBeFalsy()

    expect(deepEqual([], [{}])).toBeFalsy()
    expect(deepEqual(new Date(), new Date('1999'))).toBeFalsy()

    expect(
      deepEqual(
        {
          unknown: undefined,
          userName: '',
          fruit: '',
        },
        {
          userName: '',
          fruit: '',
          break: {},
        },
      ),
    ).toBeFalsy()
  })

  test('false for primitive and non-primitive', () => {
    expect(deepEqual(null, [])).toBeFalsy()
    expect(deepEqual([], null)).toBeFalsy()
    expect(deepEqual({}, undefined)).toBeFalsy()
    expect(deepEqual(undefined, {})).toBeFalsy()
  })

  test('true for matching sets', () => {
    expect(deepEqual([{ name: 'useFieldArray' }], [{ name: 'useFieldArray' }])).toBeTruthy()

    expect(
      deepEqual(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }, { test: '455' }],
      ),
    ).toBeTruthy()

    expect(deepEqual({}, {})).toBeTruthy()

    expect(deepEqual([], [])).toBeTruthy()

    expect(
      deepEqual([{ test: '123' }, { test: '455' }], [{ test: '123' }, { test: '455' }]),
    ).toBeTruthy()

    expect(
      deepEqual(
        [
          {
            test: '123',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
          {
            test: '455',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
        ],
        [
          {
            test: '123',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
          {
            test: '455',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
        ],
      ),
    ).toBeTruthy()
  })

  test('compares date time', () => {
    expect(deepEqual({ test: new Date('1990') }, { test: new Date('1990') })).toBeTruthy()
  })
})