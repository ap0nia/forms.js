import { describe, test, expect } from 'vitest'

import { parseValidationRule } from '../../../src/logic/helpers/parse-validation-rule'

describe('parseValidationRule', () => {
  test('object rule', () => {
    const rule = { value: 1, message: 'error' }
    const result = parseValidationRule(rule)
    expect(result).toEqual(rule)
  })

  test('regexp rule', () => {
    const rule = /foo/
    const result = parseValidationRule(rule)
    expect(result).toEqual({ value: rule, message: '' })
  })

  test('string rule', () => {
    const rule = 'foo'
    const result = parseValidationRule(rule)
    expect(result).toEqual({ value: rule, message: '' })
  })
})
