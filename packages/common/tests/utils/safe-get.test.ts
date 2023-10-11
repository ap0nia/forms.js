import { describe, test, expect } from 'vitest'

import { safeGet, safeGetMultiple } from '../../src/utils/safe-get'

describe('safeGet', () => {
  test('returns the original object for nullish key or object ', () => {
    const input = null
    const key = null
    const output = null

    expect(safeGet(input, key)).toBe(output)
  })

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

  test('number key', () => {
    const input = { 0: 123 }
    const key = 0
    const output = 123
    expect(safeGet(input, key)).toBe(output)

    const input2 = [123]
    const key2 = 0
    const output2 = 123
    expect(safeGet(input2, key2)).toBe(output2)
  })

  test('symbol key', () => {
    const input = { [Symbol.for('test')]: 123 }
    const key = Symbol.for('test')
    const output = 123
    expect(safeGet(input, key)).toBe(output)
  })
})

describe('safeGetMultiple', () => {
  test('should return the entire object if no key is provided', () => {
    const obj = { foo: { bar: { baz: 'qux' } } }

    const result = safeGetMultiple(obj, null)

    expect(result).toEqual(obj)
  })

  test('should return the value of a single key', () => {
    const obj = { foo: { bar: { baz: 'qux' } } }

    const result = safeGetMultiple(obj, 'foo.bar.baz')

    expect(result).toEqual('qux')
  })

  test('should return the value of multiple keys', () => {
    const obj = { foo: { bar: { baz: 'qux' } } }

    const result = safeGetMultiple(obj, ['foo.bar.baz', 'foo.bar.qux'])

    expect(result).toEqual(['qux', undefined])
  })
})
