import { describe, test, expect } from 'vitest'

import { deepSet } from '../../src/utils/deep-set'

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/set.test.ts
 */
describe('set react-hook-form', () => {
  test('should set the correct values', () => {
    const test1 = { a: [{ b: { c: 3 } }] }
    expect(deepSet(test1, 'a[0].b.c', 4)).toEqual(4)
    expect(test1.a[0]?.b.c).toEqual(4)

    const test2 = { foo: { bar: 'baz' } }
    expect(deepSet(test2, 'foo.arr[0]', 3)).toEqual(3)
    expect(test2).toEqual({
      foo: {
        bar: 'baz',
        arr: [3],
      },
    })

    const test3 = { foo: { bar: 'baz' } }
    expect(deepSet(test3, 'foo.arr["1"]', true)).toEqual(true)
    expect(test3).toEqual({
      foo: {
        bar: 'baz',
        // eslint-disable-next-line no-sparse-arrays
        arr: [, true],
      },
    })

    const test4 = { foo: { bar: 'baz' } }
    expect(deepSet(test4, 'foo.obj.key', 'test')).toEqual('test')
    expect(test4).toEqual({
      foo: {
        bar: 'baz',
        obj: { key: 'test' },
      },
    })

    const test5 = { foo: 1 }
    expect(deepSet(test5, 'foo.obj.key', 3)).toEqual(3)
    expect(test5).toEqual({
      foo: {
        obj: {
          key: 3,
        },
      },
    })

    const test6 = {}
    expect(deepSet(test6, 'foo.arr[0].obj.key', 1)).toEqual(1)
    expect(test6).toEqual({
      foo: {
        arr: [
          {
            obj: {
              key: 1,
            },
          },
        ],
      },
    })
  })
})
