import { describe, test, expect } from 'vitest'

import { safeGet } from '../../src/utils/safe-get'

describe('safe get', () => {
  test('empty object and empty key', () => {
    const input = {}
    const key = ''
    const output = undefined

    expect(safeGet(input, key)).toBe(output)
  })

  test('empty object and non-empty key', () => {
    const input = {}
    const key = 'a.b.c'
    const output = undefined

    expect(safeGet(input, key)).toBe(output)
  })

  test('non-empty object and simple existing key', () => {
    const input = { a: 123 }
    const key = 'a'
    const output = 123

    expect(safeGet(input, key)).toBe(output)
  })

  test('non-empty object and simple non-existing key', () => {
    const input = { a: 123 }
    const key = 'b'
    const output = undefined

    expect(safeGet(input, key)).toBe(output)
  })

  test('non-empty object and complex existing key', () => {
    const input = { a: { b: { c: 123 } } }
    const key = 'a.b.c'
    const output = 123

    expect(safeGet(input, key)).toBe(output)
  })

  test('non-empty object and complex non-existing key', () => {
    const input = { a: { b: { c: 123 } } }
    const key = 'a.b.d'
    const output = undefined

    expect(safeGet(input, key)).toBe(output)
  })
})

/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/__tests__/utils/get.test.ts
 */
describe('react-hook-form get tests', () => {
  test('should get the right data', () => {
    const test = {
      bill: [1, 2, 3],
      luo: [1, 3, { betty: 'test' }],
      betty: { test: { test1: [{ test2: 'bill' }] } },
      'betty.test.test1[0].test1': 'test',
      'dotted.filled': 'content',
      'dotted.empty': '',
    }

    expect(safeGet(test, 'bill')).toEqual([1, 2, 3])
    expect(safeGet(test, 'bill[0]')).toEqual(1)
    expect(safeGet(test, 'luo[2].betty')).toEqual('test')
    expect(safeGet(test, 'betty.test.test1[0].test2')).toEqual('bill')
    expect(safeGet(test, 'betty.test.test1[0].test1')).toEqual('test')
    expect(safeGet(test, 'betty.test.test1[0].test3')).toEqual(undefined)
    expect(safeGet(test, 'dotted.filled')).toEqual(test['dotted.filled'])
    expect(safeGet(test, 'dotted.empty')).toEqual(test['dotted.empty'])

    // expect(safeGet(test, 'dotted.nonexistent', 'default')).toEqual('default')
  })

  test('should get from the flat data', () => {
    const test = {
      bill: 'test',
    }

    expect(safeGet(test, 'bill')).toEqual('test')
  })

  test('should return undefined when provided with empty path', () => {
    const test = {
      bill: 'test',
    }

    expect(safeGet(test, '')).toEqual(undefined)
    expect(safeGet(test, undefined)).toEqual(undefined)
    expect(safeGet(test, null)).toEqual(undefined)
  })
})
