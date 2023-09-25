import { describe, test, expect } from 'vitest'

import { safeGet } from '../../src/utils/safe-get'

describe('safeGet', () => {
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
  })

  test('should get from the flat data', () => {
    const input = { bill: 'test' }

    expect(safeGet(input, 'bill')).toEqual('test')
  })

  test('should return undefined when provided with empty path', () => {
    const input = { bill: 'test' }

    expect(safeGet(input, '')).toEqual(undefined)

    expect(safeGet(input, undefined)).toEqual(undefined)

    expect(safeGet(input, null)).toEqual(undefined)
  })
})
