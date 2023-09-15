import { describe, it, expect } from 'vitest'

import { deepEqual } from '../../src/utils/deep-equal'

describe('deepEqual', () => {
  it('returns whether left and right are identical for primitive values', () => {
    expect(deepEqual(1, 1)).toBeTruthy()
    expect(deepEqual(1, 2)).toBeFalsy()
    expect(deepEqual('1', '1')).toBeTruthy()
    expect(deepEqual('1', '2')).toBeFalsy()
    expect(deepEqual(true, true)).toBeTruthy()
    expect(deepEqual(true, false)).toBeFalsy()
    expect(deepEqual(null, null)).toBeTruthy()
    expect(deepEqual(null, undefined)).toBeFalsy()
    expect(deepEqual(undefined, undefined)).toBeTruthy()
  })

  it('should return false when two sets not match', () => {
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

  it('should return false when either type is primitive', () => {
    expect(deepEqual(null, [])).toBeFalsy()
    expect(deepEqual([], null)).toBeFalsy()
    expect(deepEqual({}, undefined)).toBeFalsy()
    expect(deepEqual(undefined, {})).toBeFalsy()
  })

  it('should return true when two sets matches', () => {
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

  it('should compare date time object valueOf', () => {
    expect(deepEqual({ test: new Date('1990') }, { test: new Date('1990') })).toBeTruthy()
  })
})
