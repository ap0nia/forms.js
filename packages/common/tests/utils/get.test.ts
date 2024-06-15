import { describe, test, expect } from 'vitest'

import { get, getMultiple } from '../../src/utils/get'

describe('get', () => {
  test('returns default value for nullish key or object ', () => {
    const input = null
    const key = null
    const output = Symbol('hello')

    expect(get(input, key, output)).toBe(output)
  })

  test('returns undefined for empty object and empty key', () => {
    const input = {}
    const key = ''
    const output = undefined

    expect(get(input, key)).toBe(output)
  })

  test('returns undefined for empty object and non-empty key', () => {
    const input = {}
    const key = 'a.b.c'
    const output = undefined

    expect(get(input, key)).toBe(output)
  })

  test('returns value for non-empty object and simple existing key', () => {
    const input = { a: 123 }
    const key = 'a'
    const output = 123

    expect(get(input, key)).toBe(output)
  })

  test('returns undefined non-empty object and simple non-existing key', () => {
    const input = { a: 123 }
    const key = 'b'
    const output = undefined

    expect(get(input, key)).toBe(output)
  })

  test('returns value for non-empty object and complex existing key', () => {
    const input = { a: { b: { c: 123 } } }
    const key = 'a.b.c'
    const output = 123

    expect(get(input, key)).toBe(output)
  })

  test('returns undefined for non-empty object and complex non-existing key', () => {
    const input = { a: { b: { c: 123 } } }
    const key = 'a.b.d'
    const output = undefined

    expect(get(input, key)).toBe(output)
  })

  test('returns top level property for number key', () => {
    const input = { 0: 123 }
    const key = 0
    const output = 123
    expect(get(input, key)).toBe(output)

    const input2 = [123]
    const key2 = 0
    const output2 = 123
    expect(get(input2, key2)).toBe(output2)
  })

  test('returns top level property for symbol key', () => {
    const input = { [Symbol.for('test')]: 123 }
    const key = Symbol.for('test')
    const output = 123
    expect(get(input, key)).toBe(output)
  })
})

describe('getMultiple', () => {
  test('returns the entire object if no key is provided', () => {
    const obj = { foo: { bar: { baz: 'qux' } } }

    const result = getMultiple(obj, null)

    expect(result).toEqual(obj)
  })

  test('returns the value of a single key', () => {
    const obj = { foo: { bar: { baz: 'qux' } } }

    const result = getMultiple(obj, 'foo.bar.baz')

    expect(result).toEqual('qux')
  })

  test('returns the value of multiple keys', () => {
    const obj = { foo: { bar: { baz: 'qux' } } }

    const result = getMultiple(obj, ['foo.bar.baz', 'foo.bar.qux'])

    expect(result).toEqual(['qux', undefined])
  })
})
