import { beforeAll, afterAll, describe, it, expect } from 'vitest'

import { cloneObject } from '../../src/utils/clone-object'
import { noop } from '../../src/utils/noop'

describe('clone', () => {
  it('should clone object and not mutate the original object', () => {
    const fileData = new File([''], 'filename')
    const data = {
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
    }

    const copy = cloneObject(data)
    expect(cloneObject(data)).toEqual(copy)

    // @ts-expect-error Add new property.
    copy.test.what = '1243'
    copy.test.date = new Date('2020-10-16')

    // @ts-expect-error Add new item to Array<never>.
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

    // @ts-expect-error Define actual array for Array<never>.
    data.items = [1, 2, 3]

    expect(copy.items).toEqual([2])
  })

  it('should skip clone if a node is instance of function', () => {
    const data = {
      test: {
        testFunction: noop,
        test: 'inner-string',
        deep: {
          testFunction: noop,
          test: 'deep-string',
        },
      },
      testFunction: noop,
      other: 'string',
    }

    const copy = cloneObject(data)
    data.test.deep.test = 'changed-deep-string'

    expect(copy).toEqual({
      test: {
        test: 'inner-string',
        deep: {
          testFunction: noop,
          test: 'deep-string',
        },
        testFunction: noop,
      },
      testFunction: noop,
      other: 'string',
    })
  })

  describe('in presence of Array polyfills', () => {
    beforeAll(() => {
      // @ts-expect-error Add new property to Array prototype.
      Array.prototype.somePolyfill = () => 123
    })

    it('should skip polyfills while cloning', () => {
      const data = [1]
      const copy = cloneObject(data)

      expect(Object.hasOwn(copy, 'somePolyfill')).toBe(false)
    })

    afterAll(() => {
      // @ts-expect-error Remove property from Array prototype.
      delete Array.prototype.somePolyfill
    })
  })
})
