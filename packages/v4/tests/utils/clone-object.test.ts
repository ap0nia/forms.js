/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/cloneObject.test.ts
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest'

import { cloneObject } from '../../src/utils/clone-object'

describe('clone - react hook form', () => {
  test('should clone object and not mutate the original object', () => {
    const fileData = new File([''], 'filename')

    const data = {
      items: [] as number[],
      test: {
        date: new Date('2020-10-15'),
        test0: 12,
        test1: '12',
        test2: [1, 2, 3, 4],
        deep: {
          date: new Date('2020-10-15'),
          test0: 12,
          test1: '12',
          test2: [
            1,
            2,
            3,
            4,
            {
              file: fileData,
            },
          ],
          file: fileData,
        },
      },
      file: fileData,
      test2: new Set([1, 2]),
      test1: new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]),
    }

    const copy = cloneObject(data)

    expect(cloneObject(data)).toEqual(copy)

    // @ts-expect-error This property doesn't exist.
    copy.test.what = '1243'

    copy.test.date = new Date('2020-10-16')

    copy.items[0] = 2

    expect(data).toEqual({
      items: [],
      test: {
        date: new Date('2020-10-15'),
        test0: 12,
        test1: '12',
        test2: [1, 2, 3, 4],
        deep: {
          date: new Date('2020-10-15'),
          test0: 12,
          test1: '12',
          test2: [
            1,
            2,
            3,
            4,
            {
              file: fileData,
            },
          ],
          file: fileData,
        },
      },
      file: fileData,
      test2: new Set([1, 2]),
      test1: new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]),
    })

    data.items = [1, 2, 3]

    expect(copy.items).toEqual([2])
  })

  test('should skip clone if a node is instance of function', () => {
    function testFunction() {}

    const data = {
      test: {
        testFunction,
        test: 'inner-string',
        deep: {
          testFunction,
          test: 'deep-string',
        },
      },
      testFunction,
      other: 'string',
    }

    const copy = cloneObject(data)
    data.test.deep.test = 'changed-deep-string'

    expect(copy).toEqual({
      test: {
        test: 'inner-string',
        deep: {
          testFunction,
          test: 'deep-string',
        },
        testFunction,
      },
      testFunction,
      other: 'string',
    })
  })

  describe('in presence of Array polyfills', () => {
    beforeAll(() => {
      // @ts-expect-error This property doesn't exist.
      Array.prototype.somePolyfill = () => 123
    })

    test('should skip polyfills while cloning', () => {
      const data = [1]
      const copy = cloneObject(data)

      expect(Object.hasOwn(copy, 'somePolyfill')).toBe(false)
    })

    afterAll(() => {
      // @ts-expect-error This property doesn't exist.
      delete Array.prototype.somePolyfill
    })
  })
})
