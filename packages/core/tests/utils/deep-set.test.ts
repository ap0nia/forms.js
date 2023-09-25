import { describe, test, expect } from 'vitest'

import { deepSet } from '../../src/utils/deep-set'

describe('deepSet', () => {
  test('mutates top level property for number key', () => {
    const obj = { '0': 0 }

    expect(deepSet(obj, 0, 2)).toEqual(2)

    expect(obj['0']).toEqual(2)
  })

  test('mutates top level property for symbol key', () => {
    const key = Symbol.for('a')

    const test2 = { [key]: 'hello' }

    expect(deepSet(test2, key, 'world')).toEqual('world')

    expect(test2[key]).toEqual('world')
  })

  test('does not do anything for null object', () => {
    expect(deepSet(null, 'foo', 'bar')).toEqual('bar')
  })
})
