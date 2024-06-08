import { describe, it, test, expect } from 'vitest'

import { getRuleValue } from '../../../src/logic/validation/get-rule-value'

describe('getRuleValue', () => {
  describe('returns rule if it is not an object or a RegExp', () => {
    test('nullish', () => {
      expect(getRuleValue()).toBe(undefined)
    })

    test('string', () => {
      const rule = 'foo'
      expect(getRuleValue(rule)).toBe(rule)
    })
  })

  describe('rule is a RegExp', () => {
    test('returns rule.source if rule is a RegExp', () => {
      const rule = /foo/
      expect(getRuleValue(rule)).toBe(rule.source)
    })
  })

  describe('rule is an object', () => {
    test('returns rule.value.source if rule.value is a RegExp', () => {
      const rule = { value: /foo/ }
      expect(getRuleValue(rule)).toBe(rule.value.source)
    })

    test('returns rule.value if rule.value is not a RegExp', () => {
      const rule = { value: 'foo' }
      expect(getRuleValue(rule)).toBe(rule.value)
    })
  })
})

describe('react-hook-form', () => {
  describe('getRuleValue', () => {
    it('should return associated rule value', () => {
      expect(getRuleValue('1990/09/09')).toEqual('1990/09/09')
      expect(getRuleValue('2')).toEqual('2')
      expect(getRuleValue(2)).toEqual(2)

      expect(getRuleValue(/test/)).toEqual('test')

      expect(getRuleValue({ value: '2', message: 'data' })).toEqual('2')
      expect(getRuleValue({ value: '1990/09/09', message: 'data' })).toEqual('1990/09/09')
      expect(getRuleValue({ value: 2, message: 'data' })).toEqual(2)
      expect(getRuleValue({ value: /test/, message: 'data' })).toEqual('test')
    })

    it('should return undefined when no value is set', () => {
      expect(getRuleValue(undefined)).toBeUndefined()
    })
  })
})
