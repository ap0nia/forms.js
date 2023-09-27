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

    const obj = { [key]: 'hello' }

    expect(deepSet(obj, key, 'world')).toEqual('world')

    expect(obj).toEqual({ [key]: 'world' })
  })

  test('does not do anything for null object', () => {
    const obj = null

    expect(deepSet(obj, 'foo', 'bar')).toEqual('bar')

    expect(obj).toEqual(null)
  })

  test('sets existing property for nested objects', () => {
    const obj = { foo: { bar: 'baz' } }

    expect(deepSet(obj, 'foo.bar', 'world')).toEqual('world')

    expect(obj).toEqual({ foo: { bar: 'world' } })
  })

  test('sets new property for nested objects', () => {
    const obj = {}

    expect(deepSet(obj, 'foo.baz', 'world')).toEqual('world')

    expect(obj).toEqual({ foo: { baz: 'world' } })
  })

  test('sets existing property for nested arrays', () => {
    const obj = { foo: { bar: ['baz'] } }

    expect(deepSet(obj, 'foo.bar[0]', 'world')).toEqual('world')

    expect(obj).toEqual({ foo: { bar: ['world'] } })
  })

  test('sets new property for nested arrays', () => {
    const obj = {}

    expect(deepSet(obj, 'foo.bar[1]', 'world')).toEqual('world')

    expect(obj).toEqual({ foo: { bar: [undefined, 'world'] } })
  })
})
