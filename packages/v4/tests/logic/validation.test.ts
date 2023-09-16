import { describe, test, expect } from 'vitest'

import { getValidateError } from '../../src/logic/validation'

describe('validation logic', () => {
  test('defined field error with string validate result', () => {
    const ref = document.createElement('input')
    expect(getValidateError('', ref)).not.toBeFalsy()
  })

  test('defined field error with defined string array validate result', () => {
    const ref = document.createElement('input')
    expect(getValidateError(['', ''], ref)).not.toBeFalsy()
  })
})
