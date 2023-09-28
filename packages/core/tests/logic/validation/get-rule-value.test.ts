import { describe, test, expect } from 'vitest'

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
