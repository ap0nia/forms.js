import { describe, test, expect } from 'vitest'

import { parseValidationResult } from '../../../src/logic/helpers/parse-validation-result'

describe('parseValidationResult', () => {
  test('string result', () => {
    const result = parseValidationResult('error', {} as any)
    expect(result).toEqual({
      type: 'validate',
      message: 'error',
      ref: {},
    })
  })

  test('string array result', () => {
    const result = parseValidationResult(['error1', 'error2'], {} as any)
    expect(result).toEqual({
      type: 'validate',
      message: '',
      ref: {},
    })
  })

  test('false result', () => {
    const result = parseValidationResult(false, {} as any)
    expect(result).toEqual({
      type: 'validate',
      message: '',
      ref: {},
    })
  })
})
