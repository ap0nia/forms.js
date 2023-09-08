import { describe, test, expect } from 'vitest'

import { safeGetMultiple } from '../../src/utils/safe-get-multiple'

describe('safe get multiple', () => {
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
