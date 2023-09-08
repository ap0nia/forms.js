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
